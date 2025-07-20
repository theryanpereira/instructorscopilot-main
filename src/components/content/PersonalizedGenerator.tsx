import { useState } from "react";
import { Wand2, User, BookOpen, Target, Brain, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface StudentProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  previousKnowledge: string;
  goals: string;
}

interface ContentRequest {
  topic: string;
  contentType: 'lesson' | 'explanation' | 'practice' | 'summary';
  difficulty: number;
  duration: number;
  personalizations: string[];
}

export function PersonalizedGenerator() {
  const { toast } = useToast();
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    learningStyle: 'visual',
    skillLevel: 'intermediate',
    interests: [],
    previousKnowledge: '',
    goals: ''
  });

  const [contentRequest, setContentRequest] = useState<ContentRequest>({
    topic: '',
    contentType: 'lesson',
    difficulty: 5,
    duration: 30,
    personalizations: []
  });

  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const addInterest = (interest: string) => {
    if (interest.trim() && !studentProfile.interests.includes(interest.trim())) {
      setStudentProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (interest: string) => {
    setStudentProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

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
Based on your ${studentProfile.skillLevel} level and ${studentProfile.learningStyle} learning style, this ${contentRequest.contentType} will help you:

- Understand the core concepts of ${contentRequest.topic}
- Apply knowledge through ${studentProfile.learningStyle === 'kinesthetic' ? 'hands-on activities' : 'targeted exercises'}
- Connect this topic to your interests: ${studentProfile.interests.slice(0, 2).join(', ')}

## Content Overview
${generatePersonalizedText()}

## Practice Activities
${generateActivities()}

## Next Steps
Continue building on this foundation by exploring advanced topics that align with your goal: "${studentProfile.goals}"`;

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

  const generatePersonalizedText = () => {
    const styles = {
      visual: "This lesson includes diagrams, charts, and visual examples to help you see the concepts clearly.",
      auditory: "Listen to the explanations and discuss the concepts to reinforce your understanding.",
      kinesthetic: "Engage with hands-on activities and real-world applications to learn by doing.",
      reading: "Detailed written explanations and reading materials provide comprehensive coverage."
    };

    return styles[studentProfile.learningStyle];
  };

  const generateActivities = () => {
    const activities = {
      visual: "- Create mind maps and flowcharts\n- Analyze visual case studies\n- Draw concept diagrams",
      auditory: "- Participate in group discussions\n- Record and review explanations\n- Use verbal repetition techniques",
      kinesthetic: "- Complete hands-on simulations\n- Build physical models\n- Practice real-world applications",
      reading: "- Complete written exercises\n- Analyze text-based case studies\n- Write reflective summaries"
    };

    return activities[studentProfile.learningStyle];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Personalized Content Generator</h1>
        <p className="text-muted-foreground mt-1">
          Create AI-powered content tailored to individual learning preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Profile
            </CardTitle>
            <CardDescription>
              Define the learner's characteristics and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Learning Style</Label>
              <Select 
                value={studentProfile.learningStyle} 
                onValueChange={(value: StudentProfile['learningStyle']) => 
                  setStudentProfile(prev => ({ ...prev, learningStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual Learner</SelectItem>
                  <SelectItem value="auditory">Auditory Learner</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
                  <SelectItem value="reading">Reading/Writing Learner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Skill Level</Label>
              <Select 
                value={studentProfile.skillLevel} 
                onValueChange={(value: StudentProfile['skillLevel']) => 
                  setStudentProfile(prev => ({ ...prev, skillLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Interests</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {studentProfile.interests.map((interest, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
              <Input 
                placeholder="Add interests (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addInterest(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>

            <div>
              <Label>Previous Knowledge</Label>
              <Textarea 
                placeholder="What does the student already know about this subject?"
                value={studentProfile.previousKnowledge}
                onChange={(e) => setStudentProfile(prev => ({ 
                  ...prev, 
                  previousKnowledge: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label>Learning Goals</Label>
              <Textarea 
                placeholder="What does the student want to achieve?"
                value={studentProfile.goals}
                onChange={(e) => setStudentProfile(prev => ({ 
                  ...prev, 
                  goals: e.target.value 
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Request */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Content Request
            </CardTitle>
            <CardDescription>
              Specify what content you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Topic</Label>
              <Input 
                placeholder="Enter the topic or subject"
                value={contentRequest.topic}
                onChange={(e) => setContentRequest(prev => ({ 
                  ...prev, 
                  topic: e.target.value 
                }))}
              />
            </div>

            <div>
              <Label>Content Type</Label>
              <Select 
                value={contentRequest.contentType} 
                onValueChange={(value: ContentRequest['contentType']) => 
                  setContentRequest(prev => ({ ...prev, contentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Full Lesson</SelectItem>
                  <SelectItem value="explanation">Concept Explanation</SelectItem>
                  <SelectItem value="practice">Practice Exercises</SelectItem>
                  <SelectItem value="summary">Topic Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty Level: {contentRequest.difficulty}/10</Label>
              <Slider
                value={[contentRequest.difficulty]}
                onValueChange={(value) => setContentRequest(prev => ({ 
                  ...prev, 
                  difficulty: value[0] 
                }))}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Duration (minutes)</Label>
              <Input 
                type="number"
                min="5"
                max="120"
                value={contentRequest.duration}
                onChange={(e) => setContentRequest(prev => ({ 
                  ...prev, 
                  duration: parseInt(e.target.value) || 30 
                }))}
              />
            </div>

            <Button 
              onClick={generatePersonalizedContent}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
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
                    <Target className="mr-2 h-4 w-4" />
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
  );
}