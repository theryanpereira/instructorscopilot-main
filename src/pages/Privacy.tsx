import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Database, Mail } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Data Protection Commitment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                At Masterplan, we are committed to protecting your privacy and ensuring 
                the security of your personal information. This Privacy Policy explains 
                how we collect, use, and protect your data when you use our AI-powered 
                educational content creation platform.
              </p>
              <p>
                We operate on the principle of data minimization - we only collect 
                what's necessary to provide our services effectively.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-500" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Information</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Email address and name for account creation</li>
                  <li>Authentication credentials (securely hashed)</li>
                  <li>Profile information you choose to provide</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Educational Content</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Course materials and content you create</li>
                  <li>Teaching style samples you upload</li>
                  <li>Student intake form responses (anonymized)</li>
                  <li>Usage patterns to improve AI recommendations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Data</h4>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li>Device and browser information</li>
                  <li>IP address and general location</li>
                  <li>Usage analytics and performance metrics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Provide and improve our AI-powered content generation services</li>
                <li>Personalize your experience based on your teaching style</li>
                <li>Authenticate your account and ensure platform security</li>
                <li>Send important service updates and educational resources</li>
                <li>Analyze usage patterns to enhance platform performance</li>
                <li>Comply with legal obligations and protect user rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security & Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                We implement industry-standard security measures including encryption 
                at rest and in transit, secure authentication, and regular security 
                audits. Your data is stored securely and access is strictly limited 
                to authorized personnel.
              </p>
              <p>
                We retain your data only as long as necessary to provide our services 
                or as required by law. You can request data deletion at any time through 
                your account settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights & Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Restrict processing in certain circumstances</li>
                <li>Data portability where technically feasible</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-500" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have questions about this Privacy Policy or how we handle 
                your data, please contact us:
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> privacy@masterplan.ai</p>
                <p><strong>Data Protection Officer:</strong> dpo@masterplan.ai</p>
                <p><strong>Address:</strong> Available upon request</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Privacy;