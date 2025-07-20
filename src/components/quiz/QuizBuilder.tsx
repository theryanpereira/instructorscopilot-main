import { useState } from "react";
import { Plus, Trash2, Save, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
}

interface Quiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  totalPoints: number;
}

export function QuizBuilder() {
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    description: "",
    questions: [],
    totalPoints: 0
  });

  const [previewMode, setPreviewMode] = useState(false);

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'multiple-choice',
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1
    };
    
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      totalPoints: prev.totalPoints + 1
    }));
  };

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ),
      totalPoints: prev.questions.reduce((sum, q) => 
        sum + (q.id === id ? (updates.points ?? q.points) : q.points), 0
      )
    }));
  };

  const deleteQuestion = (id: string) => {
    const questionToDelete = quiz.questions.find(q => q.id === id);
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
      totalPoints: prev.totalPoints - (questionToDelete?.points || 0)
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = quiz.questions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const saveQuiz = () => {
    if (!quiz.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title",
        variant: "destructive"
      });
      return;
    }

    if (quiz.questions.length === 0) {
      toast({
        title: "Error", 
        description: "Please add at least one question",
        variant: "destructive"
      });
      return;
    }

    // Save quiz logic here (would integrate with backend)
    toast({
      title: "Quiz Saved",
      description: `"${quiz.title}" has been saved successfully`,
    });
  };

  const renderQuestionEditor = (question: QuizQuestion, index: number) => (
    <Card key={question.id} className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Question {index + 1}</Badge>
            <Badge variant="secondary">{question.points} pts</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => deleteQuestion(question.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Question Type</Label>
            <Select 
              value={question.type} 
              onValueChange={(value: QuizQuestion['type']) => 
                updateQuestion(question.id, { type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Points</Label>
            <Input 
              type="number" 
              min="1" 
              value={question.points}
              onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>

        <div>
          <Label>Question</Label>
          <Textarea 
            placeholder="Enter your question here..."
            value={question.question}
            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
          />
        </div>

        {question.type === 'multiple-choice' && (
          <div>
            <Label>Answer Options</Label>
            <div className="space-y-2">
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === optionIndex}
                    onChange={() => updateQuestion(question.id, { correctAnswer: optionIndex })}
                  />
                  <Input 
                    placeholder={`Option ${optionIndex + 1}`}
                    value={option}
                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {question.type === 'true-false' && (
          <div>
            <Label>Correct Answer</Label>
            <Select 
              value={question.correctAnswer?.toString()} 
              onValueChange={(value) => updateQuestion(question.id, { correctAnswer: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Explanation (Optional)</Label>
          <Textarea 
            placeholder="Provide an explanation for the correct answer..."
            value={question.explanation || ""}
            onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderQuizPreview = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <CardDescription>{quiz.description}</CardDescription>
          <div className="flex gap-2">
            <Badge>{quiz.questions.length} Questions</Badge>
            <Badge variant="secondary">{quiz.totalPoints} Total Points</Badge>
          </div>
        </CardHeader>
      </Card>

      {quiz.questions.map((question, index) => (
        <Card key={question.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-medium">
                {index + 1}. {question.question}
              </h3>
              <Badge variant="outline">{question.points} pts</Badge>
            </div>

            {question.type === 'multiple-choice' && (
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input type="radio" name={`preview-${question.id}`} />
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            )}

            {question.type === 'true-false' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="radio" name={`preview-${question.id}`} />
                  <span>True</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" name={`preview-${question.id}`} />
                  <span>False</span>
                </div>
              </div>
            )}

            {(question.type === 'short-answer' || question.type === 'essay') && (
              <Textarea 
                placeholder={question.type === 'essay' ? "Write your essay here..." : "Enter your answer here..."}
                rows={question.type === 'essay' ? 5 : 3}
                disabled
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz Builder</h1>
          <p className="text-muted-foreground mt-1">
            Create interactive quizzes and exercises for your students
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit Mode" : "Preview"}
          </Button>
          <Button onClick={saveQuiz}>
            <Save className="mr-2 h-4 w-4" />
            Save Quiz
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
              <CardDescription>Set up the basic information for your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Quiz Title</Label>
                <Input 
                  placeholder="Enter quiz title..."
                  value={quiz.title}
                  onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe what this quiz covers..."
                  value={quiz.description}
                  onChange={(e) => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Time Limit (minutes)</Label>
                  <Input 
                    type="number" 
                    placeholder="Optional"
                    value={quiz.timeLimit || ""}
                    onChange={(e) => setQuiz(prev => ({ 
                      ...prev, 
                      timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex gap-2">
                    <Badge variant="outline">{quiz.questions.length} Questions</Badge>
                    <Badge variant="secondary">{quiz.totalPoints} Total Points</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Questions</h2>
              <Button onClick={addQuestion}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {quiz.questions.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No questions added yet</p>
                    <Button onClick={addQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              quiz.questions.map((question, index) => renderQuestionEditor(question, index))
            )}
          </div>
        </>
      ) : (
        renderQuizPreview()
      )}
    </div>
  );
}