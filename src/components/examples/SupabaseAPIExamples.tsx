import React, { useState, useEffect } from 'react';
import { courseAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for better type safety
type Course = Database['public']['Tables']['courses']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

// Example component showing how to use the Supabase APIs
export const CourseManagementExample = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    difficulty_level: 'Beginner',
    estimated_duration: 4,
    subject_area: 'General'
  });

  // Load user courses on component mount
  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const userCourses = await courseAPI.getUserCourses(user!.id);
      setCourses(userCourses);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const courseData = {
        ...newCourse,
        user_id: user.id,
      };

      const createdCourse = await courseAPI.createCourse(courseData);
      
      toast({
        title: "Success",
        description: "Course created successfully!"
      });

      // Add the new course to the list
      setCourses(prev => [createdCourse, ...prev]);
      
      // Reset form
      setNewCourse({
        title: '',
        description: '',
        difficulty_level: 'Beginner',
        estimated_duration: 4,
        subject_area: 'General'
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive"
      });
      console.error('Error creating course:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await courseAPI.deleteCourse(courseId);
      
      toast({
        title: "Success",
        description: "Course deleted successfully!"
      });

      // Remove from the list
      setCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      });
      console.error('Error deleting course:', error);
    }
  };

  if (!user) {
    return <div>Please sign in to manage courses.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Course Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              value={newCourse.title}
              onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter course title"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newCourse.description}
              onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter course description"
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <select
              id="difficulty"
              title="Select difficulty level"
              value={newCourse.difficulty_level}
              onChange={(e) => setNewCourse(prev => ({ ...prev, difficulty_level: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <Label htmlFor="duration">Estimated Duration (weeks)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="52"
              value={newCourse.estimated_duration}
              onChange={(e) => setNewCourse(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) || 1 }))}
              placeholder="Enter duration in weeks"
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject Area</Label>
            <Input
              id="subject"
              value={newCourse.subject_area}
              onChange={(e) => setNewCourse(prev => ({ ...prev, subject_area: e.target.value }))}
              placeholder="Enter subject area"
            />
          </div>

          <Button 
            onClick={createCourse} 
            disabled={loading || !newCourse.title}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Course'}
          </Button>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading courses...</div>
          ) : courses.length === 0 ? (
            <div>No courses yet. Create your first course above!</div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  className="p-4 border rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {course.difficulty_level} • {course.estimated_duration} weeks • {course.subject_area}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Navigate to edit course page
                        console.log('Edit course:', course.id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => deleteCourse(course.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Example of using user profile API
export const UserProfileExample = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userAPI.getProfile(user!.id);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    try {
      await userAPI.upsertProfile({
        user_id: user!.id,
        ...profileData
      });
      
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
      
      await loadProfile(); // Reload profile
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
      console.error('Error updating profile:', error);
    }
  };

  if (!user) {
    return <div>Please sign in to view profile.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading profile...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Full Name:</strong> {profile?.full_name || 'Not set'}
            </div>
            <div>
              <strong>Institution:</strong> {profile?.institution || 'Not set'}
            </div>
            <div>
              <strong>Role:</strong> {profile?.role || 'Not set'}
            </div>
            
            <Button 
              onClick={() => {
                // You can create a form to update these values
                updateProfile({
                  full_name: 'John Doe',
                  institution: 'Example University',
                  role: 'Professor'
                });
              }}
            >
              Update Profile (Demo)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
