import { useState } from "react";
import { Wand2, Upload, BookOpen, Target, Brain, Sparkles, FilePlus } from "lucide-react";
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
}

export function PersonalizedGenerator() {
  const { toast } = useToast();
  
  // File validation handlers
  const handleFileChange = (e, allowedTypes, label) => {
    const file = e.target.files?.[0];
    if (file && !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
      toast({
        title: 'Invalid file type',
        description: `Please upload a valid ${label} file (${allowedTypes.join(', ')})`,
        variant: 'destructive',
      });
      e.target.value = '';
    }
  };

  const [contentRequest, setContentRequest] = useState<ContentRequest>({
    topic: '',
    contentType: 'lesson',
    difficulty: null,
    duration: 30,
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePersonalizedContent = async () => {
    if (!contentRequest.topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for content generation",
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
              <FilePlus className="h-5 w-5 text-foreground" />
              Required Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <UploadBoxSmall
              id="curriculum"
              label="Upload curriculum (mandatory)"
              fileTypesText="Upload .pdf or .md file"
              allowedTypes={['.pdf', '.md']}
              onFileChange={handleFileChange}
            />

            <UploadBoxSmall
              id="student-profile"
              label="Upload student profile (optional)"
              fileTypesText="Upload .csv file"
              allowedTypes={['.csv']}
              onFileChange={handleFileChange}
              optional
            />

            <UploadBoxSmall
              id="teaching-style"
              label="Upload teaching style (optional)"
              fileTypesText="Upload .json or .md file"
              allowedTypes={['.json', '.md']}
              onFileChange={handleFileChange}
              optional
            />
            
            {/* Describe Teaching Style */}
            <div className="space-y-2">
              <Label htmlFor="teaching-style-description">Describe your teaching style (optional)</Label>
              <Textarea 
                id="teaching-style-description"
                placeholder="E.g., I like to use real-world examples, keep things conversational, and break complex ideas into simple, step-by-step explanations."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Request and Output - now on the right */}
        <Card> {/* Content Requirements Card */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-foreground" />
              Content Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Topic for Content (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="topic-for-content">Topic for course content</Label>
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
              <Label htmlFor="difficulty">Content difficulty</Label>
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
                  <SelectItem value="1">Foundational</SelectItem>
                  <SelectItem value="2">Intermediate</SelectItem>
                  <SelectItem value="3">Advanced</SelectItem>
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

      {/* Generated Content - now below both panels, centered and full width */}
      <div className="flex justify-center">
        <div className="w-full">
          {/* Generate Button */}
          <Button 
            onClick={generatePersonalizedContent}
            disabled={isGenerating}
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