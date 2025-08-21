import { useState } from "react";
import { UserPlus, Users, Mail, Trash2, Eye, Edit, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Reviewer {
  id: string;
  email: string;
  name: string;
  role: 'viewer' | 'editor' | 'admin';
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: string;
  lastActive?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  modules: number;
}

export function ReviewerAccess() {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [newReviewerEmail, setNewReviewerEmail] = useState('');
  const [newReviewerRole, setNewReviewerRole] = useState<'viewer' | 'editor'>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');

  // Mock data - would come from backend
  const projects: Project[] = [
    {
      id: '1',
      title: 'React Advanced Course',
      description: 'Complete React course with hooks, context, and testing',
      modules: 12
    },
    {
      id: '2',
      title: 'TypeScript Fundamentals',
      description: 'Learn TypeScript from basics to advanced patterns',
      modules: 8
    }
  ];

  const [reviewers, setReviewers] = useState<Reviewer[]>([
    {
      id: '1',
      email: 'sarah.reviewer@example.com',
      name: 'Sarah Johnson',
      role: 'editor',
      status: 'accepted',
      invitedAt: '2024-01-10',
      lastActive: '2024-01-15'
    },
    {
      id: '2',
      email: 'mike.teacher@example.com',
      name: 'Mike Chen',
      role: 'viewer',
      status: 'pending',
      invitedAt: '2024-01-12'
    }
  ]);

  const inviteReviewer = () => {
    if (!newReviewerEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Error", 
        description: "Please select a project",
        variant: "destructive"
      });
      return;
    }

    const newReviewer: Reviewer = {
      id: Math.random().toString(36).substr(2, 9),
      email: newReviewerEmail,
      name: newReviewerEmail.split('@')[0],
      role: newReviewerRole,
      status: 'pending',
      invitedAt: new Date().toISOString().split('T')[0]
    };

    setReviewers(prev => [...prev, newReviewer]);
    setNewReviewerEmail('');
    setInviteMessage('');

    toast({
      title: "Invitation Sent",
      description: `Invited ${newReviewerEmail} as ${newReviewerRole}`,
    });
  };

  const removeReviewer = (reviewerId: string) => {
    setReviewers(prev => prev.filter(r => r.id !== reviewerId));
    toast({
      title: "Reviewer Removed",
      description: "Reviewer access has been revoked",
    });
  };

  const updateReviewerRole = (reviewerId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    setReviewers(prev => prev.map(r => 
      r.id === reviewerId ? { ...r, role: newRole } : r
    ));
    toast({
      title: "Role Updated",
      description: `Reviewer role changed to ${newRole}`,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'editor': return <Edit className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'default';
      case 'pending': return 'secondary';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviewer Access</h1>
          <p className="text-muted-foreground mt-1">
            Invite collaborators to review and edit your course content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invite Reviewer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Reviewer
            </CardTitle>
            <CardDescription>
              Add collaborators to your course project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.modules} modules
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Email Address</Label>
              <Input 
                type="email"
                placeholder="reviewer@example.com"
                value={newReviewerEmail}
                onChange={(e) => setNewReviewerEmail(e.target.value)}
              />
            </div>

            <div>
              <Label>Access Role</Label>
              <Select 
                value={newReviewerRole} 
                onValueChange={(value: 'viewer' | 'editor') => setNewReviewerRole(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Viewer - Can view and comment
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Editor - Can view, comment, and edit
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Invitation Message (Optional)</Label>
              <Textarea 
                placeholder="Add a personal message to your invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={inviteReviewer} className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        {/* Current Reviewers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Reviewers
            </CardTitle>
            <CardDescription>
              Manage access and permissions for your collaborators
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reviewers invited yet</p>
                <p className="text-sm">Invite collaborators to get feedback on your content</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviewers.map(reviewer => (
                  <div key={reviewer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{reviewer.name}</span>
                        <Badge variant={getRoleBadgeVariant(reviewer.role)}>
                          <span className="flex items-center gap-1">
                            {getRoleIcon(reviewer.role)}
                            {reviewer.role}
                          </span>
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(reviewer.status)}>
                          {reviewer.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{reviewer.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited: {reviewer.invitedAt}
                        {reviewer.lastActive && ` • Last active: ${reviewer.lastActive}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={reviewer.role}
                        onValueChange={(value: 'viewer' | 'editor' | 'admin') => 
                          updateReviewerRole(reviewer.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeReviewer(reviewer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}