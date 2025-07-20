import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Palette, Database, Key } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input placeholder="john@example.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea placeholder="Tell us about yourself..." rows={3} />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Teaching Style
            </CardTitle>
            <CardDescription>Configure your AI tone and style preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Teaching Style</label>
              <Textarea 
                placeholder="Describe your teaching style, preferred analogies, tone..." 
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Subject Focus</label>
              <Input placeholder="e.g., Programming, Data Science, Business" />
            </div>
            <Button>Update Style</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Supabase Integration
            </CardTitle>
            <CardDescription>Connect your database and backend services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Badge variant="outline" className="mb-2">Not Connected</Badge>
              <p className="text-sm text-muted-foreground mb-4">
                Connect to Supabase to enable authentication, database, and AI features
              </p>
              <Button>Connect to Supabase</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              API Integrations
            </CardTitle>
            <CardDescription>Manage your external service connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Google Drive API</label>
              <div className="flex gap-2">
                <Input placeholder="API Key" type="password" />
                <Button variant="outline">Test</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">GROQ API Key</label>
              <div className="flex gap-2">
                <Input placeholder="API Key" type="password" />
                <Button variant="outline">Test</Button>
              </div>
            </div>
            <Button>Save API Keys</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;