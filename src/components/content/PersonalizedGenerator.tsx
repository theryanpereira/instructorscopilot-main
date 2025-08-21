import { useState } from "react";
import { Wand2, Upload, BookOpen, Target, Brain, Sparkles, FilePlus, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { UploadBoxBig } from "../ui/upload-box-big";
import { UploadBoxSmall } from "../ui/upload-box-small";

interface ContentRequest {
  topic: string;
  contentType: 'lesson' | 'explanation' | 'practice' | 'summary';
  difficulty: number | null;
  duration: number;
  teachingStyle: string | null; 
  curriculumFileSelected: boolean; 
  curriculumFileName: string | null; // New prop for curriculum file name
}

export function PersonalizedGenerator() {
  const { toast } = useToast();
  
  // Async function to save course settings to the backend
  const saveCourseSettingsToBackend = async (
    course_title: string,
    difficulty_level: number | null,
    duration: number,
    teaching_style: string | null
  ) => {
    // Retrieve user_id from localStorage
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      console.error("Error: user_id not found in localStorage. Cannot save course settings.");
      toast({
        title: "Error",
        description: "User session not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        user_id: user_id,
        course_title: course_title,
        difficulty_level: difficulty_level,
        duration: duration,
        teaching_style: teaching_style,
      };

      // TEST CODE: Log payload before sending
      console.log("TEST CODE: Sending payload to /save-course-settings:", payload);

      const response = await fetch('/save-course-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log("Course settings saved to backend successfully.");
        // TEST CODE: Log successful response
        console.log("TEST CODE: /save-course-settings success response:", await response.json());
      } else {
        const errorData = await response.json();
        console.error("Failed to save course settings to backend.", errorData);
        // TEST CODE: Log error response
        console.error("TEST CODE: /save-course-settings error response:", errorData);
      }
    } catch (error) {
      console.error("Error sending course settings to backend:", error);
      // TEST CODE: Log catch error
      console.error("TEST CODE: Error in saveCourseSettingsToBackend catch block:", error);
    }
  };

  // File validation handlers
  const handleFileChange = async (e, allowedTypes, id) => { // Changed 'label' to 'id'
    console.log(`handleFileChange called for id: ${id}`);
    const file = e.target.files?.[0];
    console.log("Selected file:", file);

    if (id === 'curriculum') { // Check against id
      const newFileSelected = !!file;
      const newFileName = file ? file.name : null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/upload-curriculum/', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            toast({
              title: "Upload Successful",
              description: "",
            });
          } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || "File upload failed.");
          }
        } catch (error) {
          toast({
            title: "Upload Failed",
            description: `Error uploading file: ${error.message}`,
            variant: 'destructive',
          });
          e.target.value = ''; // Clear the input field on error
          setContentRequest(prev => ({ ...prev, curriculumFileSelected: false, curriculumFileName: null }));
          return;
        }
      }

      setContentRequest(prev => {
        console.log(`Updating curriculum state: selected=${newFileSelected}, name=${newFileName}`);
        return {
          ...prev, 
          curriculumFileSelected: newFileSelected,
          curriculumFileName: newFileName,
        };
      });
    }
    if (file && !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) { // Changed 'id' to 'type' here
      console.log("File validation failed for:", file.name);
      toast({
        title: 'Invalid file type',
        description: `Please upload a valid ${id} file (${allowedTypes.join(', ')})`,
        variant: 'destructive',
      });
      e.target.value = '';
      // Clear file name if invalid
      if (id === 'curriculum') { // Check against id
        setContentRequest(prev => {
          console.log("Clearing curriculum state due to invalid file.");
          return { ...prev, curriculumFileSelected: false, curriculumFileName: null };
        });
      }
    } else if (file) {
      console.log("File validation passed for:", file.name);
    }
  };

  const [contentRequest, setContentRequest] = useState<ContentRequest>({
    topic: '',
    contentType: 'lesson',
    difficulty: null,
    duration: 0,
    teachingStyle: null,
    curriculumFileSelected: false, // Initialize to false
    curriculumFileName: null, // Initialize file name
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Derived state to check if all mandatory fields are filled
  const canGenerate = 
    contentRequest.topic.trim() !== '' &&
    contentRequest.difficulty !== null &&
    contentRequest.teachingStyle !== null &&
    contentRequest.curriculumFileSelected &&
    contentRequest.duration > 0; // Added check for duration

  const generatePersonalizedContent = async () => {
    if (!canGenerate) {
      toast({
        title: "Missing Information",
        description: "Please enter all mandatory details to generate course content.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Save course settings to the backend before generating content
      await saveCourseSettingsToBackend(
        contentRequest.topic,
        contentRequest.difficulty,
        contentRequest.duration,
        contentRequest.teachingStyle
      );

      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockContent = `# ${contentRequest.topic}

## Learning Objectives
This ${contentRequest.contentType} will help you:

- Understand the core concepts of ${contentRequest.topic}
- Apply knowledge through targeted exercises

## Content Overview
This lesson includes diagrams, charts, and visual examples to help you see the concepts clearly.

## Practice Activities
- Complete written exercises
- Analyze text-based case studies
- Write reflective summaries

## Next Steps
Continue building on this foundation by exploring advanced topics.`;

      setGeneratedContent(mockContent);
      
      toast({
        title: "Content Generated",
        description: "Personalized content has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: `Failed to generate content: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Content Generator</h1>
        <p className="text-muted-foreground mt-1">
          AI-accelerated course generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Inputs - now on the left */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-foreground" />
              Course Structure & Teaching style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <UploadBoxSmall
              id="curriculum"
              label="Upload curriculum (mandatory)"
              fileTypesText="Upload .pdf or .docx file"
              allowedTypes={['.pdf', '.docx']}
              onFileChange={handleFileChange}
              fileName={contentRequest.curriculumFileName} // Pass the file name
            />

            {/* Teaching Style Select */}
            <div className="space-y-2">
              <Label htmlFor="teaching-style">Teaching style <span className="text-red-500">*</span></Label>
              <Select
                value={contentRequest.teachingStyle || ''}
                onValueChange={value => setContentRequest(prev => ({ ...prev, teachingStyle: value }))}
              >
                <SelectTrigger id="teaching-style">
                  <SelectValue placeholder="Select a teaching style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exploratory-guided" className="font-bold">Exploratory & Guided</SelectItem>
                  <SelectItem value="project-based" className="font-bold">Project-Based / Hands-On</SelectItem>
                  <SelectItem value="conceptual-conversational" className="font-bold">Conceptual & Conversational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Teaching Style Descriptions */}
            <div className="space-y-4 text-sm">
              <p className="font-semibold text-foreground">Teaching style descriptions:</p>
              <p>
                <span className="font-semibold text-foreground">Exploratory & Guided:</span> Encourage curiosity, pose questions, and guide learners to discover insights through problems or case studies
              </p>
              <p>
                <span className="font-semibold text-foreground">Project-Based / Hands-On:</span> Focus on real-world tasks, projects, or examples. Ideal for teaching by doing and skill development.
              </p>
              <p>
                <span className="font-semibold text-foreground">Conceptual & Conversational:</span> Break down complex ideas using analogies and clear, friendly language. Great for simplifying tough concepts
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Content Request and Output - now on the right */}
        <Card> {/* Content Requirements Card */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-foreground" />
              Course Details & Scope
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Topic for Content (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="topic-for-content">Course topic or title <span className="text-red-500">*</span></Label>
              <Textarea 
                id="topic-for-content"
                placeholder="E.g., Introduction to Quantum Physics, Basics of Machine Learning, History of Ancient Rome"
                rows={1}
                value={contentRequest.topic}
                onChange={(e) => setContentRequest(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            {/* Content Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Content difficulty <span className="text-red-500">*</span></Label>
              <Select
                value={contentRequest.difficulty !== null ? contentRequest.difficulty.toString() : ''}
                onValueChange={value => {
                  let difficulty: number | null = null;
                  if (value === '1') difficulty = 1;
                  else if (value === '2') difficulty = 2;
                  else if (value === '3') difficulty = 3;
                  setContentRequest(prev => ({ ...prev, difficulty }));
                }}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="font-bold">Foundational</SelectItem>
                  <SelectItem value="2" className="font-bold">Intermediate</SelectItem>
                  <SelectItem value="3" className="font-bold">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Descriptions */}
            <div className="space-y-4 text-sm">
              <p className="font-semibold text-foreground">Difficulty levels</p>
              <p>
                <span className="font-semibold text-foreground">Foundational:</span> No prior knowledge needed. Teaches core concepts, terms, and workflows with relatable examples and visuals. Ideal for first-timers or early learners.
              </p>
              <p>
                <span className="font-semibold text-foreground">Intermediate:</span> Assumes basic familiarity. Builds skills through applied understanding, structured breakdowns, and real-world use cases. Great for those looking to deepen their grasp.
              </p>
              <p>
                <span className="font-semibold text-foreground">Advanced:</span> Designed for experienced learners. Explores systems, edge cases, research insights, and practical implementation challenges in depth.
              </p>
            </div>

            
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Optional Inputs Card - Spans full width */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-foreground" />
            Course Duration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-duration">Please enter the duration for the course in number of weeks</Label>
            <div className="flex items-center gap-2">
              <Input
                id="course-duration"
                type="number"
                placeholder="1-8"
                value={contentRequest.duration}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (value >= 1 && value <= 8) {
                    setContentRequest(prev => ({ ...prev, duration: value }));
                  } else if (e.target.value === '') {
                    setContentRequest(prev => ({ ...prev, duration: 0 })); // Allow clearing the input
                  } else {
                    toast({
                      title: "Invalid Duration",
                      description: "Please enter a duration between 1 and 8 weeks.",
                      variant: "destructive"
                    });
                  }
                }}
                className="w-16"
              />
              <span className="text-foreground text-sm">weeks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Inputs Card - Spans full width */}
      {/*
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-foreground" />
            Optional Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadBoxSmall
            id="student-profile-moved"
            label="Upload student profiles"
            fileTypesText="Upload excel file or .csv file"
            allowedTypes={['.xlsx', '.csv']}
            onFileChange={handleFileChange}
            optional
          />
        </CardContent>
      </Card>
      */}

      {/* Generated Content - now below both panels, centered and full width */}
      <div className="flex justify-center">
        <div className="w-full">
          {/* Conditional Notification Text */}
          {!canGenerate && (
            <p className="text-red-500 text-sm mb-2">
              Please enter mandatory details
            </p>
          )}
          {/* Generate Button */}
          <Button 
            onClick={generatePersonalizedContent}
            disabled={!canGenerate || isGenerating}
            className="w-full mb-6"
          >
            {isGenerating ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4 text-foreground" />
                Generate Course Content
              </>
            )}
          </Button>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-foreground" />
                Course Content Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {generatedContent}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Target className="mr-2 h-4 w-4 text-foreground" />
                      Customize Further
                    </Button>
                    <Button variant="outline" size="sm">
                      Export Content
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Generated content will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}