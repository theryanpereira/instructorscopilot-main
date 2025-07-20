import { useState } from "react";
import { Share, Copy, Eye, Users, Lock, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ShareSettings {
  accessLevel: 'public' | 'unlisted' | 'private';
  allowComments: boolean;
  expiresAt?: string;
  password?: string;
}

interface ModulePreview {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  createdAt: string;
  shareSettings: ShareSettings;
}

export function ShareablePreview() {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    accessLevel: 'unlisted',
    allowComments: true
  });
  const [shareUrl, setShareUrl] = useState<string>('');

  // Mock data - would come from backend
  const modules: ModulePreview[] = [
    {
      id: '1',
      title: 'Introduction to React Hooks',
      description: 'Learn the fundamentals of React Hooks with practical examples',
      content: 'This module covers useState, useEffect, and custom hooks...',
      author: 'John Instructor',
      createdAt: '2024-01-15',
      shareSettings: { accessLevel: 'public', allowComments: true }
    },
    {
      id: '2', 
      title: 'Advanced TypeScript Patterns',
      description: 'Master advanced TypeScript concepts for better code quality',
      content: 'Explore generics, utility types, and advanced patterns...',
      author: 'John Instructor',
      createdAt: '2024-01-10',
      shareSettings: { accessLevel: 'unlisted', allowComments: false }
    }
  ];

  const generateShareUrl = () => {
    if (!selectedModule) {
      toast({
        title: "Error",
        description: "Please select a module to share",
        variant: "destructive"
      });
      return;
    }

    // Generate shareable URL
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/preview/${selectedModule}?access=${shareSettings.accessLevel}`;
    setShareUrl(url);

    toast({
      title: "Share URL Generated",
      description: "Your module is now ready to share",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share URL copied to clipboard",
    });
  };

  const selectedModuleData = modules.find(m => m.id === selectedModule);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shareable Module Previews</h1>
          <p className="text-muted-foreground mt-1">
            Create shareable links for your course modules and get feedback
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          Phase 2
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Share Settings
            </CardTitle>
            <CardDescription>
              Configure how your module can be accessed and shared
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Module</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a module to share" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map(module => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Access Level</Label>
              <Select 
                value={shareSettings.accessLevel} 
                onValueChange={(value: 'public' | 'unlisted' | 'private') => 
                  setShareSettings(prev => ({ ...prev, accessLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Public - Anyone can find this
                    </div>
                  </SelectItem>
                  <SelectItem value="unlisted">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Unlisted - Only people with the link
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Private - Password protected
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shareSettings.accessLevel === 'private' && (
              <div>
                <Label>Password</Label>
                <Input 
                  type="password"
                  placeholder="Enter access password"
                  value={shareSettings.password || ''}
                  onChange={(e) => setShareSettings(prev => ({ 
                    ...prev, 
                    password: e.target.value 
                  }))}
                />
              </div>
            )}

            <div>
              <Label>Expiration Date (Optional)</Label>
              <Input 
                type="date"
                value={shareSettings.expiresAt || ''}
                onChange={(e) => setShareSettings(prev => ({ 
                  ...prev, 
                  expiresAt: e.target.value 
                }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="allowComments"
                checked={shareSettings.allowComments}
                onChange={(e) => setShareSettings(prev => ({ 
                  ...prev, 
                  allowComments: e.target.checked 
                }))}
              />
              <Label htmlFor="allowComments">Allow comments and feedback</Label>
            </div>

            <Button onClick={generateShareUrl} className="w-full">
              <Share className="mr-2 h-4 w-4" />
              Generate Share URL
            </Button>

            {shareUrl && (
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly />
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Module Preview
            </CardTitle>
            <CardDescription>
              See how your module will appear to viewers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedModuleData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedModuleData.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    By {selectedModuleData.author} • {selectedModuleData.createdAt}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm">{selectedModuleData.description}</p>
                </div>

                <div className="flex gap-2">
                  <Badge variant={selectedModuleData.shareSettings.accessLevel === 'public' ? 'default' : 'secondary'}>
                    {selectedModuleData.shareSettings.accessLevel}
                  </Badge>
                  {selectedModuleData.shareSettings.allowComments && (
                    <Badge variant="outline">Comments Enabled</Badge>
                  )}
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Content Preview</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedModuleData.content}
                  </p>
                </div>

                {shareSettings.allowComments && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Comments & Feedback</h4>
                    <div className="space-y-2">
                      <Textarea placeholder="Viewers can leave feedback here..." rows={3} />
                      <Button size="sm">Post Comment</Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a module to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}