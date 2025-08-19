import pathlib
import os
import re
from docx import Document
from docx.shared import Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import RGBColor
from docx.enum.text import WD_COLOR_INDEX

def read_course_content_files():
    planner_content = ""
    deep_content = ""
    
    # Read from home directory "Inputs and Outputs"
    home_dir_path = pathlib.Path("Inputs and Outputs")
    
    # Try to read planner agent instruction (directly in Inputs and Outputs)
    planner_file = home_dir_path / "planner_agent_instruction.txt"
    if planner_file.exists():
        try:
            with open(planner_file, 'r', encoding='utf-8') as f:
                planner_content = f.read()
            print(f"✅ Read planner content from: {planner_file}")
        except Exception as e:
            print(f"❌ Error reading {planner_file}: {e}")
    else:
        print(f"⚠️ Planner file not found: {planner_file}")
    
    # Read from copilot folder "Inputs and Outputs"
    copilot_dir_path = pathlib.Path("copilot/Inputs and Outputs")
    
    # Try to read deep course content output
    deep_file = copilot_dir_path / "deep_course_content_output.txt"
    if not deep_file.exists():
        # Try alternative filename
        deep_file = copilot_dir_path / "deep_agent_output.txt"
    
    if deep_file.exists():
        try:
            with open(deep_file, 'r', encoding='utf-8') as f:
                deep_content = f.read()
            print(f"✅ Read deep content from: {deep_file}")
        except Exception as e:
            print(f"❌ Error reading {deep_file}: {e}")
    else:
        print(f"⚠️ Deep content file not found in: {copilot_dir_path}")
    
    return planner_content, deep_content

def parse_weeks_from_content(content):
    """Parse the content to extract individual weeks/modules based on the specific pattern"""
    weeks = []
    
    print("🔍 Looking for week patterns: '# Week X' ... '=== WEEK X COMPLETED ==='")
    
    # Primary pattern: # Week X ... === WEEK X COMPLETED ===
    week_pattern = r'# Week (\d+)(.*?)=== WEEK \1 COMPLETED ==='
    matches = re.findall(week_pattern, content, re.DOTALL | re.IGNORECASE)
    
    if matches:
        print(f"✅ Found {len(matches)} weeks using primary pattern")
        for week_num, week_content in matches:
            weeks.append({
                'number': int(week_num),
                'type': 'Week',
                'content': week_content.strip(),
                'title': f"Week {week_num}"
            })
    else:
        print("⚠️ Primary pattern not found, trying alternative patterns...")
        
        # Alternative patterns to try
        patterns = [
            # Pattern 1: === WEEK X === ... === WEEK X COMPLETED ===
            r'=== WEEK (\d+) ===(.*?)=== WEEK \1 COMPLETED ===',
            # Pattern 2: Week X: ... === WEEK X COMPLETED ===
            r'Week (\d+):(.*?)=== WEEK \1 COMPLETED ===',
            # Pattern 3: ## Week X ... === WEEK X COMPLETED ===
            r'## Week (\d+)(.*?)=== WEEK \1 COMPLETED ===',
            # Pattern 4: ### Week X ... === WEEK X COMPLETED ===
            r'### Week (\d+)(.*?)=== WEEK \1 COMPLETED ===',
            # Pattern 5: Just split by === WEEK X COMPLETED === and work backwards
            r'(.*?)=== WEEK (\d+) COMPLETED ===',
        ]
        
        for i, pattern in enumerate(patterns):
            matches = re.findall(pattern, content, re.DOTALL | re.IGNORECASE)
            if matches:
                print(f"✅ Found {len(matches)} weeks using alternative pattern {i+1}")
                for match in matches:
                    if len(match) == 2:
                        if pattern == patterns[-1]:  # Last pattern has different order
                            week_content, week_num = match
                        else:
                            week_num, week_content = match
                        
                        weeks.append({
                            'number': int(week_num),
                            'type': 'Week',
                            'content': week_content.strip(),
                            'title': f"Week {week_num}"
                        })
                break
    
    # If still no matches, try to find any week markers and extract content between them
    if not weeks:
        print("🔍 Trying to find week markers in content...")
        
        # Look for any week markers
        week_markers = re.findall(r'(?:^|\n)(.*?Week (\d+).*?)(?=\n|$)', content, re.MULTILINE | re.IGNORECASE)
        completion_markers = re.findall(r'=== WEEK (\d+) COMPLETED ===', content, re.IGNORECASE)
        
        print(f"Found {len(week_markers)} week markers and {len(completion_markers)} completion markers")
        
        if week_markers or completion_markers:
            # Try to extract content between week numbers
            week_numbers = sorted(list(set([int(match[1]) for match in week_markers] + [int(num) for num in completion_markers])))
            
            for week_num in week_numbers:
                # Find content that mentions this week
                week_content_pattern = rf'.*?Week {week_num}.*?(?=Week {week_num + 1}|$)'
                match = re.search(week_content_pattern, content, re.DOTALL | re.IGNORECASE)
                
                if match:
                    weeks.append({
                        'number': week_num,
                        'type': 'Week',
                        'content': match.group(0).strip(),
                        'title': f"Week {week_num}"
                    })
    
    # Sort by week number
    weeks.sort(key=lambda x: x['number'])
    
    print(f"📋 Total weeks found: {len(weeks)}")
    if weeks:
        for week in weeks:
            print(f"   📅 {week['title']} - {len(week['content'])} characters")
    
    return weeks

def create_docx_for_week(week_data, output_dir):
    """Create a DOCX file for a specific week"""
    
    # Create a new document
    doc = Document()
    
    # Set document margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # Add title with week number
    title_text = f"Week {week_data['number']}: Course Content"
    title = doc.add_heading(title_text, 0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    # Add a separator line
    doc.add_paragraph('─' * 80)
    
    # Process the content
    content_lines = week_data['content'].split('\n')
    current_paragraph = ""
    in_code_block = False
    
    for line in content_lines:
        original_line = line
        line = line.strip()
        
        # Skip empty lines but add spacing
        if not line:
            if current_paragraph:
                # Handle bold formatting in current paragraph before adding
                if '**' in current_paragraph:
                    p = doc.add_paragraph()
                    parts = current_paragraph.split('**')
                    for i, part in enumerate(parts):
                        run = p.add_run(part)
                        if i % 2 == 1:  # Odd indices should be bold
                            run.bold = True
                else:
                    doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_paragraph()  # Add blank line
            continue
        
        # Handle code blocks
        if line.startswith('```'):
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            in_code_block = not in_code_block
            continue
            
        if in_code_block:
            # Add code with monospace formatting
            p = doc.add_paragraph(original_line)
            for run in p.runs:
                run.font.name = 'Courier New'
            continue
        
        # Handle different types of content formatting
        if line.startswith('###### '):  # Level 6 heading
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('###### ', ''), level=6)
            
        elif line.startswith('##### '):  # Level 5 heading
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('##### ', ''), level=5)
            
        elif line.startswith('#### '):  # Level 4 heading
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('#### ', ''), level=4)
            
        elif line.startswith('### '):  # Level 3 heading
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('### ', ''), level=3)
            
        elif line.startswith('## '):  # Level 2 heading
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('## ', ''), level=2)
            
        elif line.startswith('# ') and not line.startswith('# Week'):  # Level 1 heading (but not week title)
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('# ', ''), level=1)
        
        # Handle special sections with icons
        elif line.startswith('## 🔗') or line.startswith('## 🔍') or line.startswith('## 💡') or line.startswith('## 📚') or line.startswith('## 🌟') or line.startswith('## 📖') or line.startswith('## 🚀'):
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_heading(line.replace('## ', ''), level=2)
            
        # Handle bullet points and lists
        elif line.startswith('- ') or line.startswith('* '):
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            bullet_text = line.replace('- ', '').replace('* ', '')
            # Handle bold text in bullet points
            if '**' in bullet_text:
                p = doc.add_paragraph(style='List Bullet')
                parts = bullet_text.split('**')
                for i, part in enumerate(parts):
                    run = p.add_run(part)
                    if i % 2 == 1:  # Odd indices should be bold
                        run.bold = True
            else:
                doc.add_paragraph(bullet_text, style='List Bullet')
        
        # Handle numbered lists
        elif re.match(r'^\d+\. ', line):
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            list_text = re.sub(r'^\d+\. ', '', line)
            # Handle bold text in numbered lists
            if '**' in list_text:
                p = doc.add_paragraph(style='List Number')
                parts = list_text.split('**')
                for i, part in enumerate(parts):
                    run = p.add_run(part)
                    if i % 2 == 1:  # Odd indices should be bold
                        run.bold = True
            else:
                doc.add_paragraph(list_text, style='List Number')
        
        # Handle separator lines
        elif line.startswith('---') or line == '=' * len(line):
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            doc.add_paragraph('─' * 80)
        
        # Handle special completion markers
        elif 'COMPLETED' in line.upper() and '===' in line:
            if current_paragraph:
                doc.add_paragraph(current_paragraph)
                current_paragraph = ""
            p = doc.add_paragraph(line)
            for run in p.runs:
                run.bold = True
                run.font.color.rgb = RGBColor(0, 128, 0)  # Green color
        
        # Handle halt markers
        elif 'Halt for' in line and 'seconds' in line:
            # Skip halt markers in DOCX output
            continue
            
        # Regular content - accumulate into paragraph
        else:
            if current_paragraph:
                current_paragraph += " " + line
            else:
                current_paragraph = line
    
    # Add any remaining paragraph
    if current_paragraph:
        if '**' in current_paragraph:
            p = doc.add_paragraph()
            parts = current_paragraph.split('**')
            for i, part in enumerate(parts):
                run = p.add_run(part)
                if i % 2 == 1:  # Odd indices should be bold
                    run.bold = True
        else:
            doc.add_paragraph(current_paragraph)
    
    # Create filename - make it more descriptive
    filename = f"Week_{week_data['number']:02d}_Course_Content.docx"
    filepath = os.path.join(output_dir, filename)
    
    # Save the document
    try:
        doc.save(filepath)
        print(f"✅ Created DOCX: {filename}")
        return filepath
    except Exception as e:
        print(f"❌ Error creating DOCX for {week_data['title']}: {e}")
        return None

def create_course_material_docx():
    """Main function to create DOCX files for each week from text files"""
    
    print("📚 Starting Course Material DOCX Creation...")
    print("=" * 60)
    
    # Read content from text files
    print("🔍 Reading course content files...")
    planner_content, deep_content = read_course_content_files()
    
    if not planner_content and not deep_content:
        print("❌ No course content found. Please ensure text files exist.")
        return
    
    # Combine content for processing
    combined_content = f"{planner_content}\n\n{deep_content}"
    
    # Parse weeks from content
    print("\n📋 Parsing weeks/modules from content...")
    weeks = parse_weeks_from_content(combined_content)
    
    if not weeks:
        print("❌ No weeks/modules found in the content.")
        print("💡 Tip: Ensure your content has clear week/module markers like:")
        print("   - ### Module 1: Title")
        print("   - ## Week 1: Title") 
        print("   - === Week 1 ===")
        return
    
    # Create output directory
    output_dir = "course material"
    os.makedirs(output_dir, exist_ok=True)
    print(f"📁 Created output directory: {output_dir}")
    
    # Generate DOCX files
    print(f"\n📄 Creating DOCX files for {len(weeks)} weeks/modules...")
    created_files = []
    
    for week in weeks:
        print(f"\n🔄 Processing {week['title']}...")
        filepath = create_docx_for_week(week, output_dir)
        if filepath:
            created_files.append(filepath)
    
    # Summary
    print(f"\n{'=' * 60}")
    print("📊 COURSE MATERIAL CREATION SUMMARY")
    print(f"{'=' * 60}")
    
    if created_files:
        print(f"🎉 Successfully created {len(created_files)} DOCX files!")
        print(f"\n📁 Files created in '{output_dir}' directory:")
        for filepath in created_files:
            print(f"   📄 {os.path.basename(filepath)}")
        
        print(f"\n💡 Each week's content has been properly formatted with:")
        print("   - Proper headings and subheadings")
        print("   - Bullet points for lists")
        print("   - Bold text for emphasis")
        print("   - Clean document structure")
        
    else:
        print("❌ No DOCX files were created successfully.")
        
    return created_files

def main():
    """Run the course material creation process"""
    try:
        # Check if required package is installed
        try:
            import docx
        except ImportError:
            print("❌ python-docx package not found!")
            print("📦 Installing python-docx...")
            os.system("pip install python-docx")
            import docx
            
        created_files = create_course_material_docx()
        
        if created_files:
            print("\n✅ Course material creation completed successfully!")
            print(f"📁 Check the 'course material' folder for {len(created_files)} DOCX files.")
        else:
            print("\n❌ Course material creation failed.")
            
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        print("💡 Make sure you have the required packages installed:")
        print("   pip install python-docx")

if __name__ == "__main__":
    main()
