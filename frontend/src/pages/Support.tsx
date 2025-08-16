import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Mail, FileText, HelpCircle, Zap, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Support = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const faqs = [
    {
      question: "How does the AI content generation work?",
      answer: "Our AI analyzes your teaching style and creates content that matches your tone and pedagogical approach. Simply provide prompts describing what you want to create."
    },
    {
      question: "Can I export content to Google Docs?",
      answer: "Yes! During Phase 1 MVP, we support direct export to Google Docs and other popular formats. More integrations coming soon."
    },
    {
      question: "How do I upload my teaching style sample?",
      answer: "Go to Settings > Teaching Style and either upload a document or describe your approach in text. Our AI will learn from this to match your voice."
    },
    {
      question: "Is my content secure and private?",
      answer: "Absolutely. All content is encrypted and we never share your educational materials. See our Privacy Policy for full details."
    },
    {
      question: "What happens after the free MVP phase?",
      answer: "We'll introduce affordable pricing tiers with advanced features. Early users will receive special pricing and grandfathered benefits."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with Masterplan and make the most of your AI copilot
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Quick Help Cards */}
          <div className="space-y-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/onboarding")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Getting Started Guide
                </CardTitle>
                <CardDescription>
                  New to Masterplan? Follow our step-by-step onboarding process
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/create")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Course Creation Tutorial
                </CardTitle>
                <CardDescription>
                  Learn how to create your first AI-powered course module
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/settings")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Tone Training Guide
                </CardTitle>
                <CardDescription>
                  Teach our AI to match your unique teaching style and voice
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Contact Support
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Input 
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your question or issue..."
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common questions about Masterplan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <h4 className="font-semibold mb-2">{faq.question}</h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Still need help? Email us directly at{" "}
            <a href="mailto:support@masterplan.ai" className="text-primary hover:underline">
              support@masterplan.ai
            </a>
            {" "}or check our{" "}
            <button 
              onClick={() => navigate("/dashboard")}
              className="text-primary hover:underline"
            >
              dashboard
            </button>
            {" "}for more resources.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;