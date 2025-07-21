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

interface ContentRequest {
  topic: string;
  contentType: 'lesson' | 'explanation' | 'practice' | 'summary';
  difficulty: number;
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
    difficulty: 1,
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
        <h1 className="text-3xl font-bold">Personalized Content Generator</h1>
        <p className="text-muted-foreground mt-1">
          Create AI-powered content tailored to individual learning preferences
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
            {/* Upload Curriculum */}
            <div className="space-y-2">
              <Label htmlFor="curriculum-upload">Upload Curriculum (Mandatory) <span className="text-red-500">*</span></Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload .pdf or .md file
                </p>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('curriculum-file')?.click()}>
                  Choose File
                </Button>
                <Input id="curriculum-file" type="file" accept=".pdf,.md" className="hidden" onChange={e => handleFileChange(e, ['.pdf', '.md'], 'curriculum')} />
              </div>
            </div>

            {/* Upload Student Profile */}
            <div className="space-y-2">
              <Label htmlFor="student-profile-upload">Upload Student Profile (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload .csv file
                </p>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('student-profile-file')?.click()}>
                  Choose File
                </Button>
                <Input id="student-profile-file" type="file" accept=".csv" className="hidden" onChange={e => handleFileChange(e, ['.csv'], 'student profile')} />
              </div>
            </div>

            {/* Upload Teaching Style */}
            <div className="space-y-2">
              <Label htmlFor="teaching-style-upload">Upload Teaching Style (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload .json or .md file
                </p>
                <Button variant="outline" size="sm" onClick={() => document.getElementById('teaching-style-file')?.click()}>
                  Choose File
                </Button>
                <Input id="teaching-style-file" type="file" accept=".json,.md" className="hidden" onChange={e => handleFileChange(e, ['.json', '.md'], 'teaching style')} />
              </div>
            </div>
            
            {/* Describe Teaching Style */}
            <div className="space-y-2">
              <Label htmlFor="teaching-style-description">Describe Your Teaching Style (Optional)</Label>
              <Textarea 
                id="teaching-style-description"
                placeholder="E.g., I like to use real-world examples, keep things conversational, and break complex ideas into simple, step-by-step explanations."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Request and Output - now on the right */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-foreground" />
                Content Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic for Content (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="topic-upload">Topic for Content (Optional)</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload .pdf or .md</p>
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('topic-file')?.click()}>
                    Choose File
                  </Button>
                  <Input id="topic-file" type="file" accept=".pdf,.md" className="hidden" onChange={e => handleFileChange(e, ['.pdf', '.md'], 'topic')} />
                </div>
              </div>

              {/* Content Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Content Difficulty</Label>
                <Select
                  value={contentRequest.difficulty.toString()}
                  onValueChange={value => {
                    let difficulty = 1;
                    if (value === '1') difficulty = 1;
                    else if (value === '2') difficulty = 2;
                    else if (value === '3') difficulty = 3;
                    setContentRequest(prev => ({ ...prev, difficulty }));
                  }}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Basic + Fundamentals</SelectItem>
                    <SelectItem value="2">Intermediate</SelectItem>
                    <SelectItem value="3">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generatePersonalizedContent}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin text-foreground" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 text-foreground" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Content - now below both panels, centered and full width */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-foreground" />
                Generated Content
              </CardTitle>
              <CardDescription>
                AI-personalized content based on the student profile
              </CardDescription>
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