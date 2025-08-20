import { useState, useRef, useEffect } from "react";
import { Wand2, Upload, BookOpen, Target, Brain, Sparkles, FilePlus, Layers, ClipboardCheck, Download, ChevronLeft, ChevronRight } from "lucide-react";
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

interface QuizFile {
  name: string;
  content: string;
  type: 'txt' | 'pdf';
  pdfExists: boolean; // Track if corresponding PDF exists
  pdfName: string; // Name of the corresponding PDF file
}

interface PNGFlashcard {
  questionFile: string;
  answerFile: string;
  questionPath: string;
  answerPath: string;
  index: number;
}

interface PowerPointFile {
  name: string;
  path: string;
  size: string;
  week: number;
}

export function PersonalizedGenerator() {
  const { toast } = useToast();
  
  // File validation handlers
  const handleFileChange = (e, allowedTypes, id) => { // Changed 'label' to 'id'
    console.log(`handleFileChange called for id: ${id}`);
    const file = e.target.files?.[0];
    console.log("Selected file:", file);

    if (id === 'curriculum') { // Check against id
      const newFileSelected = !!file;
      const newFileName = file ? file.name : null;
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
    duration: 30,
    teachingStyle: null,
    curriculumFileSelected: false, // Initialize to false
    curriculumFileName: null, // Initialize file name
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<string>('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<string>('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [flashcards, setFlashcards] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  
  // New state for presentation
  const [generatedPresentation, setGeneratedPresentation] = useState<string>('');
  const [isGeneratingPresentation, setIsGeneratingPresentation] = useState(false);

  // New state for quiz files
  const [quizFiles, setQuizFiles] = useState<QuizFile[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [isLoadingQuizFiles, setIsLoadingQuizFiles] = useState<boolean>(false);

  // New state for PNG flashcards
  const [pngFlashcards, setPngFlashcards] = useState<PNGFlashcard[]>([]);
  const [currentPngFlashcardIndex, setCurrentPngFlashcardIndex] = useState<number>(0);
  const [isLoadingPngFlashcards, setIsLoadingPngFlashcards] = useState<boolean>(false);

  // New state for PowerPoint files
  const [powerPointFiles, setPowerPointFiles] = useState<PowerPointFile[]>([]);
  const [currentPowerPointIndex, setCurrentPowerPointIndex] = useState<number>(0);
  const [isLoadingPowerPointFiles, setIsLoadingPowerPointFiles] = useState<boolean>(false);

  // Derived state to check if all mandatory fields are filled
  const canGenerate = 
    contentRequest.topic.trim() !== '' &&
    contentRequest.difficulty !== null &&
    contentRequest.teachingStyle !== null &&
    contentRequest.curriculumFileSelected;

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
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Generates flashcards content preview using current input selections.
   */
  const generateFlashcards = async () => {
    if (!canGenerate) {
      toast({
        title: "Missing Information",
        description: "Please enter all mandatory details to generate flashcards.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingFlashcards(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockFlashcards = `# Flashcards: ${contentRequest.topic}\n\n` +
        `Q: Key concept from ${contentRequest.topic}?\n` +
        `A: Concise explanation tailored for ${contentRequest.contentType} at ` +
        `${contentRequest.difficulty === 1 ? 'Foundational' : contentRequest.difficulty === 2 ? 'Intermediate' : 'Advanced'} level.\n\n` +
        `Q: Another important idea?\n` +
        `A: Short answer that reinforces understanding.`;

      setGeneratedFlashcards(mockFlashcards);
      const parsed = parseFlashcards(mockFlashcards);
      setFlashcards(parsed);
      setCurrentFlashcardIndex(0);

      toast({
        title: "Flashcards Generated",
        description: "Flashcards have been created successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  function parseFlashcards(markdown: string): Array<{ question: string; answer: string }> {
    const lines = markdown.split(/\r?\n/);
    const cards: Array<{ question: string; answer: string }> = [];
    let currentQ: string | null = null;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('Q:')) {
        if (currentQ !== null) {
          cards.push({ question: currentQ, answer: '' });
        }
        currentQ = line.replace(/^Q:\s*/, '');
      } else if (line.startsWith('A:')) {
        const answer = line.replace(/^A:\s*/, '');
        if (currentQ !== null) {
          cards.push({ question: currentQ, answer });
          currentQ = null;
        }
      }
    }
    if (currentQ !== null) {
      cards.push({ question: currentQ, answer: '' });
    }
    return cards;
  }

  const goToPreviousFlashcard = () => {
    if (flashcards.length === 0) return;
    setCurrentFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const goToNextFlashcard = () => {
    if (flashcards.length === 0) return;
    setCurrentFlashcardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const touch = e.changedTouches[0];
    touchStartXRef.current = touch.clientX;
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (touchStartXRef.current === null) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const threshold = 50;
    if (deltaX > threshold) {
      // Swipe right - go to previous flashcard
      if (pngFlashcards.length > 0) {
        goToPreviousPngFlashcard();
      } else {
        goToPreviousFlashcard();
      }
    } else if (deltaX < -threshold) {
      // Swipe left - go to next flashcard
      if (pngFlashcards.length > 0) {
        goToNextPngFlashcard();
      } else {
        goToNextFlashcard();
      }
    }
    touchStartXRef.current = null;
  };

  /**
   * Fetches quiz files from the backend folder
   */
  const fetchQuizFiles = async () => {
    console.log('🔄 Starting to fetch quiz files from backend...');
    setIsLoadingQuizFiles(true);
    try {
      // Simulate fetching quiz files from the backend
      // In a real implementation, this would be an API call to the backend
      // that reads files from: /Users/ryanpereira/Downloads/instructorscopilot-main/backend/Inputs and Outputs/quizzes
      console.log('📁 Simulating API call to backend quiz folder...');
      
      const mockQuizFiles: QuizFile[] = [
        {
          name: "Quiz_Paper_1_Foundation_and_Analysis.txt",
          content: `=== QUIZ GENERATION ANALYSIS ===
The course content, "Advanced Hands-On Course: Fundamentals of Artificial Intelligence," spans 4 weeks and focuses on building a deeper understanding through structured applications and hands-on implementation. The target audience is experienced learners with existing AI and programming familiarity, indicating a need for advanced-level questions.

**Key Concepts identified for Foundation & Analysis:**

*   **Module 1 (Advanced Intelligent Agents and Environments):** Definitions of agent types (rational vs. classical, architectures), understanding environment properties (deterministic vs. stochastic, observable vs. partial), and performance measures. These are fundamental to understanding how AI agents operate.
*   **Module 2 (Advanced Search Techniques and Adversarial Gaming AI):** Core principles of uninformed and informed search (BFS, DFS, A*), properties of heuristic functions (admissibility, consistency), and the mechanics of adversarial search (Minimax, Alpha-Beta Pruning). This module lays the analytical groundwork for problem-solving.
*   **Module 3 (Constraint Satisfaction, Logic, and Inference Systems):** Components and algorithms for CSPs (variables, domains, constraints, backtracking, AC-3), the expressive power and syntax of propositional and first-order logic, and the mechanics of inference (forward/backward chaining). These are foundational formalisms in AI.
*   **Module 4 (Classical Planning and Knowledge Representation):** Representation in classical planning (STRIPS), basic planning algorithms (progression, regression), and the concept of ontological engineering for knowledge representation. These provide the analytical framework for designing autonomous systems.

**Quiz Design Strategy for "Foundation & Analysis":**
The quiz questions will primarily focus on:
1.  **Definitions:** Concise definitions of core AI terms and concepts.
2.  **Distinctions/Comparisons:** Highlighting key differences between related concepts or algorithms.
3.  **Purpose/Role:** Explaining the main function or importance of a technique or component.
4.  **Fundamental Principles:** Asking about the underlying ideas behind algorithms or formalisms.
5.  **Quick Application Analysis:** Briefly assessing understanding of when/why a certain method is used.

The questions will be designed to be concise, allowing for 1-2 sentence answers, suitable for the 10-15 minute time limit. The difficulty will be advanced, assuming prior exposure and requiring precise, conceptual understanding rather than simple memorization.

---

# Quiz Paper: Foundation & Analysis of AI Fundamentals

## Instructions for Students:
- Time Limit: 10-15 minutes
- Total Marks: 15 marks (1 mark per question)
- This quiz focuses on core concepts, fundamental principles, and analytical thinking from the "Fundamentals of Artificial Intelligence" course.
- Answer each question concisely (1-2 sentences maximum).
- Quick recall and understanding are tested.

## Questions:

### Question 1 (1 mark): Agent Definition
Define what constitutes a "rational agent" in the context of Artificial Intelligence.

---

### Question 2 (1 mark): Environment Properties Analysis
What is the primary difference between a "deterministic" and a "stochastic" environment regarding an AI agent's actions?

---

### Question 3 (1 mark): Agent Architecture Distinction
Briefly explain the key operational difference between a simple reflex agent and a model-based reflex agent.

---

### Question 4 (1 mark): Uninformed Search Strategy
When might Iterative Deepening Search (IDS) be a more memory-efficient choice compared to Breadth-First Search (BFS) for finding optimal solutions?

---

### Question 5 (1 mark): Informed Search Concept
What is the fundamental role of a heuristic function in informed search algorithms like A* Search?

---

### Question 6 (1 mark): Heuristic Quality
Define what it means for a heuristic function to be "admissible" in the context of A* search.

---

### Question 7 (1 mark): Adversarial Search Goal
What is the main objective of the Minimax algorithm in a two-player, zero-sum adversarial game?

---

### Question 8 (1 mark): Search Optimization Technique
Explain how Alpha-Beta Pruning enhances the efficiency of the Minimax algorithm.

---

### Question 9 (1 mark): CSP Formulation
List the three essential components required to formally define a Constraint Satisfaction Problem (CSP).

---

### Question 10 (1 mark): CSP Inference
What is the primary purpose of applying "Arc Consistency (AC-3)" in the process of solving Constraint Satisfaction Problems?

---

### Question 11 (1 mark): Logic System Expressiveness
What is the key difference in expressive power between Propositional Logic and First-Order Logic?

---

### Question 12 (1 mark): Inference Mechanism Comparison
Briefly explain the core conceptual difference between how Forward Chaining and Backward Chaining inference mechanisms operate.

---

### Question 13 (1 mark): Classical Planning Representation
What does the STRIPS representation primarily define for a classical planning problem?

---

### Question 14 (1 mark): Planning Algorithm Approach
Describe the fundamental difference in problem-solving approach between Progression (forward search) and Regression (backward search) in classical planning.

---

### Question 15 (1 mark): Knowledge Representation Purpose
In the field of AI, what is the main objective of "Ontological Engineering" in knowledge representation?`,
          type: 'txt',
          pdfExists: true,
          pdfName: "Quiz_Paper_1_Foundation_and_Analysis.pdf"
        },
        {
          name: "Quiz_Paper_2_Application_and_Synthesis.txt",
          content: `=== QUIZ GENERATION ANALYSIS ===
The course content, "Advanced Hands-On Course: Fundamentals of Artificial Intelligence," is a 4-week program designed for experienced learners. It emphasizes practical application and project-based learning.

**Course Plan Content Analysis:**
- **Target Audience:** Experienced learners, professionals, computer science/engineering students with basic AI knowledge. This indicates an expectation of prior foundational understanding.
- **Course Goals:** Design and implement intelligent agents, apply and optimize search algorithms, develop solutions with CSPs and logic, construct knowledge representation and planning systems. These goals directly point towards application and synthesis.
- **Module Breakdown:**
    - **Module 1 (Agents):** Focuses on designing, implementing, and evaluating agent architectures based on environment characteristics. Key concepts include rational agents, various architectures (utility-based, goal-based), and environment properties. The project is agent design and simulation.
    - **Module 2 (Search):** Covers informed/uninformed search, heuristic functions, and adversarial search (Minimax, Alpha-Beta Pruning). The project is Game AI development, requiring implementation and analysis of search algorithms and heuristics.
    - **Module 3 (CSPs, Logic, Inference):** Deals with formulating and solving CSPs, constructing knowledge bases using logic, and implementing inference mechanisms (forward/backward chaining). Projects involve building a CSP solver and an inference engine.
    - **Module 4 (Classical Planning, Knowledge Representation):** Introduces classical planning algorithms (STRIPS, GraphPlan), multi-agent planning, and knowledge representation using ontological engineering. Projects involve implementing a classical planner and designing an ontology.

**Deep Course Content Analysis:**
While the "Deep Course Content" was presented as "COMPLETED" without explicit details beyond the module names, the "Course Plan Content" provides sufficient depth in its "Key Concepts and Skills" and "Instructional Activities/Methods (Project-Based)" sections to infer the detailed learning. The emphasis on "hands-on projects" across all modules strongly supports the "Application & Synthesis" theme. For instance, designing utility functions, implementing game AI with Alpha-Beta pruning, building CSP and inference engines, and creating planners/ontologies are all direct applications of theoretical concepts.

**Key Concepts for Application & Synthesis Quiz:**
- How agent design choices (e.g., utility function, architecture) are influenced by environment properties (stochasticity, partial observability).
- Applying search algorithms (A*, Minimax, Alpha-Beta) to solve specific problems and optimizing their performance.
- Formulating real-world problems as CSPs and selecting appropriate solving techniques.
- Choosing between forward and backward chaining for different inference scenarios.
- Designing STRIPS operators for specific planning domains.
- The practical benefits and limitations of different knowledge representation formalisms (e.g., ontology vs. simpler structures).
- Trade-offs in multi-agent coordination.

The quiz will focus on scenario-based questions that require students to apply concepts, make justified choices, or synthesize knowledge from different areas of the course. Questions will be phrased to elicit concise, yet insightful, answers.

---

# Quiz Paper: Application and Synthesis in Advanced AI

## Instructions for Students:
- Time Limit: 10-15 minutes
- Total Marks: 12 marks (1 mark per question)
- This quiz focuses on applying core AI concepts and synthesizing knowledge across different modules.
- Answer each question concisely (1-2 sentences maximum).
- Quick recall, understanding, and practical application are tested.

## Questions:

### Question 1 (1 mark): Agent Design - Environment Impact
Consider a utility-based intelligent agent designed for a partially observable, stochastic environment. Briefly explain how the agent's utility function and state estimation strategy would need to adapt to this environment type.

---

### Question 2 (1 mark): Informed Search Application
You are developing a pathfinding AI for a package delivery drone in a city with real-time traffic updates (dynamic environment). Explain why A* Search, with a well-designed heuristic, would generally be more suitable than Breadth-First Search (BFS) in this scenario.

---

### Question 3 (1 mark): Adversarial Search Optimization
In implementing an AI for a simplified game of Chess, why is Alpha-Beta Pruning considered crucial for practical performance, beyond merely implementing the Minimax algorithm?

---

### Question 4 (1 mark): Heuristic Function Design
When designing an admissible heuristic for A* search in a route planning problem, what is the primary condition it must satisfy, and why is this important for optimality?

---

### Question 5 (1 mark): CSP Formulation
Formulate the core components of the classic N-Queens problem as a Constraint Satisfaction Problem (CSP). Identify its variables, their domains, and the essential constraint.

---

### Question 6 (1 mark): CSP Algorithm Choice
For a very large Constraint Satisfaction Problem with many loose constraints, would you primarily recommend using backtracking search with extensive constraint propagation (like AC-3) or a local search algorithm like Min-Conflicts? Justify your choice briefly.

---

### Question 7 (1 mark): Logical Inference Application
You are building a basic medical diagnosis system. If the system frequently needs to deduce new facts from symptoms (data-driven reasoning), would you primarily implement a forward chaining or a backward chaining inference engine? Explain your reasoning.

---

### Question 8 (1 mark): STRIPS Operator Design
Design a simple STRIPS operator for a robotic arm picking up an item named 'BlockA' from a table. Define its Preconditions, Effects, and the Action.

---

### Question 9 (1 mark): Planning Algorithm Choice
Consider a deterministic Blocks World planning problem. Between a simple forward (progression) search planner and a planner utilizing Planning Graphs (like GraphPlan), which would likely find a solution more efficiently for moderately complex problems, and why?

---

### Question 10 (1 mark): Knowledge Representation Evaluation
You are tasked with representing knowledge for a complex scientific research domain with evolving relationships and concepts. What is a primary advantage of using ontological engineering principles (e.g., OWL) over a simple relational database for this purpose?

---

### Question 11 (1 mark): Multi-Agent Coordination Challenge
In a multi-agent system where agents need to collaboratively achieve a shared goal, briefly describe one significant challenge in ensuring effective coordination without a central controller.

---

### Question 12 (1 mark): Agent-Environment Interaction Metrics
When evaluating the performance of a newly designed intelligent agent in a simulated environment, what two distinct types of measures (beyond just success/failure count) would you typically consider to gain a comprehensive understanding of its effectiveness?`,
          type: 'txt',
          pdfExists: true,
          pdfName: "Quiz_Paper_2_Application_and_Synthesis.pdf"
        },
        {
          name: "Quiz_Paper_3_Evaluation_and_Innovation.txt",
          content: `=== QUIZ GENERATION ANALYSIS ===
The course content, "Advanced Hands-On Course: Fundamentals of Artificial Intelligence," is designed for experienced learners, emphasizing project-based learning and advanced concepts. My analysis focused on extracting key areas related to evaluation, optimization, design choices, trade-offs, and innovation across all four modules.

**Module 1 (Advanced Intelligent Agents):** Highlighted the evaluation of agent performance, design choices for different architectures (model-based, utility-based), and the impact of environmental characteristics.
**Module 2 (Advanced Search Techniques & Adversarial Gaming AI):** Emphasized optimizing search efficiency through heuristics and pruning, and evaluating trade-offs in game AI development (depth vs. evaluation function quality).
**Module 3 (Constraint Satisfaction, Logic, and Inference Systems):** Focused on comparing CSP algorithm efficiency, developing robust solutions through careful formulation and inference rule design, and analyzing limitations.
**Module 4 (Classical Planning, Knowledge Representation):** Covered the evaluation of planning algorithms in terms of limitations and alternatives, the innovation in designing precise planning domains, and the role of ontological engineering in flexible knowledge representation.

The overarching theme of "Evaluation and Innovation" aligns well with the course's project-based nature, where students are continually designing, implementing, testing, and refining their AI solutions. The questions generated aim to test the understanding of *why* certain design choices are made, *how* performance is optimized, and *what* are the critical considerations and limitations in advanced AI applications.

---

# Quiz Paper: Evaluation and Innovation in Advanced AI

## Instructions for Students:
- Time Limit: 10-15 minutes
- Total Marks: 15 marks (1 mark per question)
- This quiz focuses on evaluating AI systems, optimizing algorithms, and innovative design choices from the course.
- Answer each question concisely (1-2 sentences maximum).
- Quick recall and understanding are tested.

## Questions:

### Question 1 (1 mark): Agent Performance Evaluation
When designing a utility-based agent, how can an ill-defined utility function hinder its effective performance in a complex, dynamic environment?

---

### Question 2 (1 mark): Agent Design Innovation
How does the design choice between a model-based reflex agent and a utility-based agent impact its ability to adapt and perform optimally in partially observable environments?

---

### Question 3 (1 mark): Heuristic Evaluation
What is the primary benefit of an *admissible* heuristic function for A* search, and how does heuristic consistency further enhance its performance guarantee?

---

### Question 4 (1 mark): Adversarial Search Optimization
Explain how Alpha-Beta Pruning achieves computational efficiency in Minimax search, and what key property of game trees enables this optimization.

---

### Question 5 (1 mark): Game AI Trade-off Analysis
In developing a game AI using Minimax, describe a critical trade-off between increasing search depth and the complexity/accuracy of the static evaluation function.

---

### Question 6 (1 mark): CSP Formulation Innovation
When modeling a problem as a Constraint Satisfaction Problem (CSP), how does an effective choice of variables and domains contribute to the efficiency of the backtracking search?

---

### Question 7 (1 mark): CSP Algorithm Evaluation
What is the main advantage of incorporating Arc Consistency (AC-3) into a CSP solver compared to a basic backtracking search, regarding pruning the search space?

---

### Question 8 (1 mark): Inference System Robustness
For a forward chaining inference engine, how can the careful design of inference rules contribute to the robustness and accuracy of conclusions drawn from a knowledge base?

---

### Question 9 (1 mark): Planning Domain Design
In classical planning with STRIPS, why is the precise definition of preconditions and effects for actions crucial for a planner to generate valid and executable plans?

---

### Question 10 (1 mark): Planning Algorithm Evaluation
What is a significant limitation of applying a simple forward (progression) search planner in large, complex planning domains, and what alternative concept from the course might mitigate this?

---

### Question 11 (1 mark): Knowledge Representation Innovation
How does the principle of *ontological engineering* guide the creation of flexible and extensible knowledge representation schemes in AI systems?

---

### Question 12 (1 mark): Multi-Agent Coordination Challenge
Identify one primary challenge in achieving effective and efficient coordination among multiple autonomous agents in a shared planning environment.

---

### Question 13 (1 mark): Problem-Solving Paradigm Choice
If both search and CSP techniques can solve a problem, what specific characteristics of the problem might lead an AI designer to innovate by choosing a CSP approach over a general state-space search?

---

### Question 14 (1 mark): AI Approach Criticality
From the course content, critically assess one limitation of strictly classical AI (e.g., deterministic planning, propositional logic) when confronted with real-world uncertainty or dynamic changes.

---

### Question 15 (1 mark): Project-Based Learning Innovation
How does the hands-on, project-based structure of this course inherently foster innovation and practical problem-solving skills in advanced AI learners?`,
          type: 'txt',
          pdfExists: false,
          pdfName: ""
        }
      ];

      console.log(`✅ Successfully loaded ${mockQuizFiles.length} quiz files:`, mockQuizFiles.map(f => f.name));
      
      setQuizFiles(mockQuizFiles);
      setCurrentQuizIndex(0);
      
      toast({
        title: "Quiz Files Loaded",
        description: `Found ${mockQuizFiles.length} quiz files from backend folder`,
      });
    } catch (error) {
      console.error('❌ Error fetching quiz files:', error);
      toast({
        title: "Error Loading Quiz Files",
        description: "Failed to load quiz files from backend",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuizFiles(false);
      console.log('🏁 Finished quiz file loading process');
    }
  };

  /**
   * Navigate to the next quiz file
   */
  const goToNextQuiz = () => {
    if (quizFiles.length === 0) return;
    setCurrentQuizIndex((prev) => (prev + 1) % quizFiles.length);
  };

  /**
   * Navigate to the previous quiz file
   */
  const goToPreviousQuiz = () => {
    if (quizFiles.length === 0) return;
    setCurrentQuizIndex((prev) => (prev - 1 + quizFiles.length) % quizFiles.length);
  };

  /**
   * Downloads the corresponding PDF file for the current quiz
   */
  const downloadCurrentQuizPDF = () => {
    const currentQuiz = quizFiles[currentQuizIndex];
    if (!currentQuiz || !currentQuiz.pdfExists) {
      toast({
        title: "PDF Not Available",
        description: "No corresponding PDF file found for this quiz",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`📥 Downloading PDF: ${currentQuiz.pdfName}`);
      
      // In a real implementation, this would download the actual PDF file
      // For now, we'll simulate the download and show a success message
      toast({
        title: "PDF Download Started",
        description: `Downloading ${currentQuiz.pdfName}`,
      });

      // Simulate file download (in real implementation, this would create a download link)
      const link = document.createElement('a');
      link.href = `#`; // Placeholder - in real implementation, this would be the actual file URL
      link.download = currentQuiz.pdfName;
      link.click();

      console.log(`✅ PDF download initiated for: ${currentQuiz.pdfName}`);
    } catch (error) {
      console.error('❌ Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download PDF file",
        variant: "destructive"
      });
    }
  };

  /**
   * Navigate to the next PNG flashcard
   */
  const goToNextPngFlashcard = () => {
    if (pngFlashcards.length === 0) return;
    setCurrentPngFlashcardIndex((prev) => (prev + 1) % pngFlashcards.length);
  };

  /**
   * Navigate to the previous PNG flashcard
   */
  const goToPreviousPngFlashcard = () => {
    if (pngFlashcards.length === 0) return;
    setCurrentPngFlashcardIndex((prev) => (prev - 1 + pngFlashcards.length) % pngFlashcards.length);
  };

  /**
   * Downloads the current PNG flashcard (question image)
   */
  const downloadCurrentPngFlashcard = () => {
    const currentFlashcard = pngFlashcards[currentPngFlashcardIndex];
    if (!currentFlashcard) {
      toast({
        title: "Flashcard Not Available",
        description: "No flashcard available for download",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`📥 Downloading PNG flashcard: ${currentFlashcard.questionFile}`);
      
      // In a real implementation, this would download the actual PNG file
      // For now, we'll simulate the download and show a success message
      toast({
        title: "PNG Flashcard Download Started",
        description: `Downloading ${currentFlashcard.questionFile}`,
      });

      // Simulate file download (in real implementation, this would create a download link)
      const link = document.createElement('a');
      link.href = `#`; // Placeholder - in real implementation, this would be the actual file URL
      link.download = currentFlashcard.questionFile;
      link.click();

      console.log(`✅ PNG flashcard download initiated for: ${currentFlashcard.questionFile}`);
    } catch (error) {
      console.error('❌ Error downloading PNG flashcard:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download PNG flashcard",
        variant: "destructive"
      });
    }
  };

  /**
   * Downloads the current PowerPoint file
   */
  const downloadCurrentPowerPoint = () => {
    const currentPowerPoint = powerPointFiles[currentPowerPointIndex];
    if (!currentPowerPoint) {
      toast({
        title: "PowerPoint Not Available",
        description: "No PowerPoint file available for download",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log(`📥 Downloading PowerPoint: ${currentPowerPoint.name}`);
      
      // In a real implementation, this would download the actual PowerPoint file
      // For now, we'll simulate the download and show a success message
      toast({
        title: "PowerPoint Download Started",
        description: `Downloading ${currentPowerPoint.name}`,
      });

      // Simulate file download (in real implementation, this would create a download link)
      const link = document.createElement('a');
      link.href = `#`; // Placeholder - in real implementation, this would be the actual file URL
      link.download = currentPowerPoint.name;
      link.click();

      console.log(`✅ PowerPoint download initiated for: ${currentPowerPoint.name}`);
    } catch (error) {
      console.error('❌ Error downloading PowerPoint:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download PowerPoint file",
        variant: "destructive"
      });
    }
  };

  /**
   * Load quiz files on component mount
   */
  useEffect(() => {
    fetchQuizFiles();
    fetchPngFlashcards();
    fetchPowerPointFiles();
  }, []);

  /**
   * Fetches PowerPoint files from the backend folder
   */
  const fetchPowerPointFiles = async () => {
    console.log('🔄 Starting to fetch PowerPoint files from backend...');
    setIsLoadingPowerPointFiles(true);
    try {
      // Simulate fetching PowerPoint files from the backend
      // In a real implementation, this would be an API call to the backend
      // that reads files from: /Users/ryanpereira/Downloads/instructorscopilot-main/backend/Inputs and Outputs/ppt
      console.log('📁 Simulating API call to backend PowerPoint folder...');
      
      const mockPowerPointFiles: PowerPointFile[] = [
        {
          name: "Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_01.pptx",
          path: "/backend/Inputs and Outputs/ppt/Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_01.pptx",
          size: "55KB",
          week: 1
        },
        {
          name: "Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_02.pptx",
          path: "/backend/Inputs and Outputs/ppt/Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_02.pptx",
          size: "53KB",
          week: 2
        },
        {
          name: "Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_03.pptx",
          path: "/backend/Inputs and Outputs/ppt/Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_03.pptx",
          size: "51KB",
          week: 3
        },
        {
          name: "Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_04.pptx",
          path: "/backend/Inputs and Outputs/ppt/Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_Week_04.pptx",
          size: "37KB",
          week: 4
        }
      ];

      console.log(`✅ Successfully loaded ${mockPowerPointFiles.length} PowerPoint files:`, mockPowerPointFiles.map(f => `Week ${f.week}`));
      
      setPowerPointFiles(mockPowerPointFiles);
      setCurrentPowerPointIndex(0);
      
      toast({
        title: "PowerPoint Files Loaded",
        description: `Found ${mockPowerPointFiles.length} presentation files from backend folder`,
      });
    } catch (error) {
      console.error('❌ Error fetching PowerPoint files:', error);
      toast({
        title: "Error Loading PowerPoint Files",
        description: "Failed to load PowerPoint files from backend",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPowerPointFiles(false);
      console.log('🏁 Finished PowerPoint file loading process');
    }
  };

  /**
   * Fetches PNG flashcards from the backend folder
   */
  const fetchPngFlashcards = async () => {
    console.log('🔄 Starting to fetch PNG flashcards from backend...');
    setIsLoadingPngFlashcards(true);
    try {
      // Simulate fetching PNG flashcards from the backend
      // In a real implementation, this would be an API call to the backend
      // that reads files from: /Users/ryanpereira/Downloads/instructorscopilot-main/backend/Inputs and Outputs/flashcards
      console.log('📁 Simulating API call to backend flashcards folder...');
      
      const mockPngFlashcards: PNGFlashcard[] = [
        {
          questionFile: "flashcard_01_question.png",
          answerFile: "flashcard_01_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_01_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_01_answer.png",
          index: 1
        },
        {
          questionFile: "flashcard_02_question.png",
          answerFile: "flashcard_02_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_02_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_02_answer.png",
          index: 2
        },
        {
          questionFile: "flashcard_03_question.png",
          answerFile: "flashcard_03_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_03_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_03_answer.png",
          index: 3
        },
        {
          questionFile: "flashcard_04_question.png",
          answerFile: "flashcard_04_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_04_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_04_answer.png",
          index: 4
        },
        {
          questionFile: "flashcard_05_question.png",
          answerFile: "flashcard_05_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_05_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_05_answer.png",
          index: 5
        },
        {
          questionFile: "flashcard_06_question.png",
          answerFile: "flashcard_06_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_06_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_06_answer.png",
          index: 6
        },
        {
          questionFile: "flashcard_07_question.png",
          answerFile: "flashcard_07_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_07_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_07_answer.png",
          index: 7
        },
        {
          questionFile: "flashcard_08_question.png",
          answerFile: "flashcard_08_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_08_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_08_answer.png",
          index: 8
        },
        {
          questionFile: "flashcard_09_question.png",
          answerFile: "flashcard_09_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_09_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_09_answer.png",
          index: 9
        },
        {
          questionFile: "flashcard_10_question.png",
          answerFile: "flashcard_10_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_10_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_10_answer.png",
          index: 10
        },
        {
          questionFile: "flashcard_11_question.png",
          answerFile: "flashcard_11_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_11_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_11_answer.png",
          index: 11
        },
        {
          questionFile: "flashcard_12_question.png",
          answerFile: "flashcard_12_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_12_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_12_answer.png",
          index: 12
        },
        {
          questionFile: "flashcard_13_question.png",
          answerFile: "flashcard_13_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_13_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_13_answer.png",
          index: 13
        },
        {
          questionFile: "flashcard_14_question.png",
          answerFile: "flashcard_14_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_14_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_14_answer.png",
          index: 14
        },
        {
          questionFile: "flashcard_15_question.png",
          answerFile: "flashcard_15_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_15_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_15_answer.png",
          index: 15
        },
        {
          questionFile: "flashcard_16_question.png",
          answerFile: "flashcard_16_answer.png",
          questionPath: "/backend/Inputs and Outputs/flashcards/flashcard_16_question.png",
          answerPath: "/backend/Inputs and Outputs/flashcards/flashcard_16_answer.png",
          index: 16
        }
      ];

      console.log(`✅ Successfully loaded ${mockPngFlashcards.length} PNG flashcard sets:`, mockPngFlashcards.map(f => `Flashcard ${f.index}`));
      
      setPngFlashcards(mockPngFlashcards);
      setCurrentPngFlashcardIndex(0);
      
      toast({
        title: "PNG Flashcards Loaded",
        description: `Found ${mockPngFlashcards.length} flashcard sets from backend folder`,
      });
    } catch (error) {
      console.error('❌ Error fetching PNG flashcards:', error);
      toast({
        title: "Error Loading PNG Flashcards",
        description: "Failed to load PNG flashcards from backend",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPngFlashcards(false);
      console.log('🏁 Finished PNG flashcard loading process');
    }
  };

  /**
   * Generates quiz content preview using current input selections.
   */
  const generateQuiz = async () => {
    if (!canGenerate) {
      toast({
        title: "Missing Information",
        description: "Please enter all mandatory details to generate a quiz.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingQuiz(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockQuiz = `# Quiz: ${contentRequest.topic}\n\n` +
        `1) Multiple-choice question related to ${contentRequest.topic}\n` +
        `A) Option 1  B) Option 2  C) Option 3  D) Option 4\n\n` +
        `2) Short answer question to check understanding.`;

      setGeneratedQuiz(mockQuiz);

      toast({
        title: "Quiz Generated",
        description: "Quiz has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  /**
   * Generates presentation content preview using current input selections.
   */
  const generatePresentation = async () => {
    if (!canGenerate) {
      toast({
        title: "Missing Information",
        description: "Please enter all mandatory details to generate a presentation.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPresentation(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPresentation = `# Presentation: ${contentRequest.topic}\n\n` +
        `## Slide 1: Introduction\n` +
        `Welcome to the ${contentRequest.topic} presentation\n` +
        `- Learning objectives\n` +
        `- Course overview\n\n` +
        `## Slide 2: Key Concepts\n` +
        `- Core principles\n` +
        `- Important definitions\n` +
        `- Real-world applications\n\n` +
        `## Slide 3: Practical Examples\n` +
        `- Case studies\n` +
        `- Hands-on demonstrations\n` +
        `- Interactive elements\n\n` +
        `## Slide 4: Summary\n` +
        `- Key takeaways\n` +
        `- Next steps\n` +
        `- Additional resources`;

      setGeneratedPresentation(mockPresentation);

      toast({
        title: "Presentation Generated",
        description: "Presentation has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPresentation(false);
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
                rows={2}
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

      {/* Optional Inputs Card - Spans full width */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-foreground" /> {/* Using Sparkles as a placeholder icon */} 
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

      {/* Generated Content - grouped into a single container */}
      <div className="flex justify-center">
        <Card className="w-full">
          <CardContent>
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
            <Button size="sm" className="mt-2" disabled={!generatedContent}>
              <Download className="mr-2 h-4 w-4 text-foreground" />
              Download
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Flashcards - grouped into a single container */}
      <div className="flex justify-center">
        <Card className="w-full">
          <CardContent>
            {!canGenerate && (
              <p className="text-red-500 text-sm mb-2">
                Please enter mandatory details
              </p>
            )}
            
            {/* Test Button for PNG Flashcards - HIDDEN FROM UI (Developer use only) */}
            {/* <div className="mb-4">
              <Button
                variant="outline"
                onClick={fetchPngFlashcards}
                disabled={isLoadingPngFlashcards}
                className="w-full"
              >
                {isLoadingPngFlashcards ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                    Loading PNG Flashcards...
                  </>
                ) : (
                  <>
                    <FilePlus className="mr-2 h-4 w-4 text-foreground" />
                    Test: Load PNG Flashcards from Backend
                  </>
                )}
              </Button>
            </div> */}
            
            <Button
              onClick={generateFlashcards}
              disabled={!canGenerate || isGeneratingFlashcards}
              className="w-full mb-6"
            >
              {isGeneratingFlashcards ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 text-foreground" />
                  Generate Flashcards
                </>
              )}
            </Button>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-foreground" />
                  Flashcards Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Show PNG flashcards if available, otherwise show generated flashcards or placeholder */}
                {pngFlashcards.length > 0 ? (
                  <div className="space-y-6">
                    {/* PNG Flashcard Display */}
                    <div 
                      className="bg-muted rounded-lg p-6 min-h-80 flex items-center justify-center text-center"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div className="w-full max-w-4xl space-y-6">
                        {/* Question Image */}
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Question {pngFlashcards[currentPngFlashcardIndex]?.index}</h4>
                          <div className="bg-background rounded-lg p-4 border shadow-sm">
                            <img 
                              src={pngFlashcards[currentPngFlashcardIndex]?.questionPath} 
                              alt={`Flashcard ${pngFlashcards[currentPngFlashcardIndex]?.index} Question`}
                              className="w-full h-auto max-h-96 object-contain mx-auto"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0QTRBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rmxhc2hjYXJkIHF1ZXN0aW9uIGltYWdlPC90ZXh0Pgo8L3N2Zz4K';
                                e.currentTarget.alt = 'Question image placeholder';
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Answer Image */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 text-foreground">Answer {pngFlashcards[currentPngFlashcardIndex]?.index}</h4>
                          <div className="bg-background rounded-lg p-4 border shadow-sm">
                            <img 
                              src={pngFlashcards[currentPngFlashcardIndex]?.answerPath} 
                              alt={`Flashcard ${pngFlashcards[currentPngFlashcardIndex]?.index} Answer`}
                              className="w-full h-auto max-h-96 object-contain mx-auto"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk0QTRBQSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Rmxhc2hjYXJkIGFuc3dlciBpbWFnZTwvdGV4dD4KPC9zdmc+Cg==';
                                e.currentTarget.alt = 'Answer image placeholder';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Controls */}
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={goToPreviousPngFlashcard}
                        disabled={pngFlashcards.length <= 1}
                        className="min-w-32"
                      >
                        <ChevronLeft className="mr-2 h-5 w-5 text-foreground" />
                        Previous
                      </Button>
                      <div className="flex items-center px-6 py-2 bg-muted rounded-lg">
                        <span className="text-lg font-semibold text-foreground">
                          {currentPngFlashcardIndex + 1} of {pngFlashcards.length}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={goToNextPngFlashcard}
                        disabled={pngFlashcards.length <= 1}
                        className="min-w-32"
                      >
                        Next
                        <ChevronRight className="ml-2 h-5 w-5 text-foreground" />
                      </Button>
                    </div>

                    {/* Flashcard Info */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        📄 PNG Flashcard Set: {pngFlashcards[currentPngFlashcardIndex]?.questionFile} / {pngFlashcards[currentPngFlashcardIndex]?.answerFile}
                      </p>
                    </div>
                  </div>
                ) : generatedFlashcards ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {generatedFlashcards}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isLoadingPngFlashcards ? "Loading PNG flashcards..." : "Generated flashcards will appear here"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button 
              size="sm" 
              className="mt-2" 
              disabled={!generatedFlashcards && pngFlashcards.length === 0}
              onClick={downloadCurrentPngFlashcard}
            >
              <Download className="mr-2 h-4 w-4 text-foreground" />
              Download PNG
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quiz - grouped into a single container */}
      <div className="flex justify-center">
        <Card className="w-full">
          <CardContent>
            {!canGenerate && (
              <p className="text-red-500 text-sm mb-2">
                Please enter mandatory details
              </p>
            )}
            
            {/* Quiz Files Navigation */}
            {quizFiles.length > 0 && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Available Quiz Files ({quizFiles.length})</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToPreviousQuiz}
                      disabled={quizFiles.length <= 1}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4 text-foreground" />
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={goToNextQuiz}
                      disabled={quizFiles.length <= 1}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4 text-foreground" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {quizFiles[currentQuizIndex]?.name}
                </p>
              </div>
            )}

            {/* Test Button for Quiz Files - HIDDEN FROM UI (Developer use only) */}
            {/* <div className="mb-4">
              <Button
                variant="outline"
                onClick={fetchQuizFiles}
                disabled={isLoadingQuizFiles}
                className="w-full"
              >
                {isLoadingQuizFiles ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                    Loading Quiz Files...
                  </>
                ) : (
                  <>
                    <FilePlus className="mr-2 h-4 w-4 text-foreground" />
                    Test: Load Quiz Files from Backend
                  </>
                )}
              </Button>
            </div> */}

            <Button
              onClick={generateQuiz}
              disabled={!canGenerate || isGeneratingQuiz}
              className="w-full mb-6"
            >
              {isGeneratingQuiz ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 text-foreground" />
                  Generate Quiz
                </>
              )}
            </Button>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-4 text-foreground" />
                  Quiz Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Show quiz files if available, otherwise show generated quiz or placeholder */}
                {quizFiles.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {quizFiles[currentQuizIndex]?.content}
                      </pre>
                    </div>
                    {quizFiles[currentQuizIndex]?.pdfExists && (
                      <div className="text-xs text-muted-foreground text-center">
                        📄 PDF available: {quizFiles[currentQuizIndex]?.pdfName}
                      </div>
                    )}
                  </div>
                ) : generatedQuiz ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {generatedQuiz}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isLoadingQuizFiles ? "Loading quiz files..." : "Generated quiz will appear here"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button 
              size="sm" 
              className="mt-2" 
              disabled={!generatedQuiz && (quizFiles.length === 0 || !quizFiles[currentQuizIndex]?.pdfExists)}
              onClick={downloadCurrentQuizPDF}
            >
              <Download className="mr-2 h-4 w-4 text-foreground" />
              Download PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Presentation - grouped into a single container */}
      <div className="flex justify-center">
        <Card className="w-full">
          <CardContent>
            {!canGenerate && (
              <p className="text-red-500 text-sm mb-2">
                Please enter mandatory details
              </p>
            )}
            
            {/* Test Button for PowerPoint Files - HIDDEN FROM UI (Developer use only) */}
            {/* <div className="mb-4">
              <Button
                variant="outline"
                onClick={fetchPowerPointFiles}
                disabled={isLoadingPowerPointFiles}
                className="w-full"
              >
                {isLoadingPowerPointFiles ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                    Loading PowerPoint Files...
                  </>
                ) : (
                  <>
                    <FilePlus className="mr-2 h-4 w-4 text-foreground" />
                    Test: Load PowerPoint Files from Backend
                  </>
                )}
              </Button>
            </div> */}
            
            <Button
              onClick={generatePresentation}
              disabled={!canGenerate || isGeneratingPresentation}
              className="w-full mb-6"
            >
              {isGeneratingPresentation ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4 text-foreground" />
                  Generate Presentation
                </>
              )}
            </Button>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-4 text-foreground" />
                  Presentation Content Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Show PowerPoint files if available, otherwise show generated presentation or placeholder */}
                {powerPointFiles.length > 0 ? (
                  <div className="space-y-4">
                    {/* PowerPoint Files List */}
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm mb-3 text-foreground">Available PowerPoint Presentations:</h4>
                        {powerPointFiles.map((powerPointFile, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                              currentPowerPointIndex === index 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background hover:bg-accent border-border'
                            }`}
                            onClick={() => setCurrentPowerPointIndex(index)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                currentPowerPointIndex === index ? 'bg-primary-foreground' : 'bg-muted-foreground'
                              }`} />
                              <div>
                                <p className={`font-medium text-sm ${
                                  currentPowerPointIndex === index ? 'text-primary-foreground' : 'text-foreground'
                                }`}>
                                  Week {powerPointFile.week}: {powerPointFile.name.replace('Advanced Hands-On Course_ Fundamentals of Artificial Intelligence_', '')}
                                </p>
                                <p className={`text-xs ${
                                  currentPowerPointIndex === index ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}>
                                  {powerPointFile.size}
                                </p>
                              </div>
                            </div>
                            <div className={`text-xs ${
                              currentPowerPointIndex === index ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {currentPowerPointIndex === index ? 'Selected' : 'Click to select'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Current Selection Info */}
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        📊 Currently Selected: {powerPointFiles[currentPowerPointIndex]?.name}
                      </p>
                    </div>
                  </div>
                ) : generatedPresentation ? (
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm">
                        {generatedPresentation}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {isLoadingPowerPointFiles ? "Loading PowerPoint files..." : "Generated presentation will appear here"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Button 
              size="sm" 
              className="mt-2" 
              disabled={!generatedPresentation && powerPointFiles.length === 0}
              onClick={powerPointFiles.length > 0 ? downloadCurrentPowerPoint : undefined}
            >
              <Download className="mr-2 h-4 w-4 text-foreground" />
              Download {powerPointFiles.length > 0 ? 'PowerPoint' : 'Presentation'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}