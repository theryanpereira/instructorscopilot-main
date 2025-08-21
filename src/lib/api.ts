import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type aliases for easier use
type Course = Database['public']['Tables']['courses']['Row'];
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type QuizInsert = Database['public']['Tables']['quizzes']['Insert'];
type QuizUpdate = Database['public']['Tables']['quizzes']['Update'];

// Course Management APIs
export const courseAPI = {
  // Get all courses for the current user
  async getUserCourses(userId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a new course
  async createCourse(courseData: CourseInsert) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update an existing course
  async updateCourse(id: string, courseData: CourseUpdate) {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...courseData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a course
  async deleteCourse(id: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get a specific course by ID
  async getCourse(id: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// User Profile APIs
export const userAPI = {
  // Get user profile
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create or update user profile
  async upsertProfile(profile: ProfileInsert) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        ...profile,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user avatar
  async updateAvatar(userId: string, avatarFile: File) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;

    // Upload avatar to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new avatar URL - note: you'll need an avatar_url field in your profiles table
    return await this.upsertProfile({
      user_id: userId,
      // avatar_url: publicUrl, // Uncomment if you add this field to your profiles table
    });
  }
};

// Quiz Management APIs
export const quizAPI = {
  // Get all quizzes for a course
  async getCourseQuizzes(courseId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Create a new quiz
  async createQuiz(quizData: QuizInsert) {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quizData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a quiz
  async updateQuiz(id: string, quizData: QuizUpdate) {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ ...quizData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a quiz
  async deleteQuiz(id: string) {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// File Storage APIs
export const storageAPI = {
  // Upload a file to Supabase storage
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  },

  // Download a file from Supabase storage
  async downloadFile(bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  },

  // Get public URL for a file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  },

  // Delete a file
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }
};

// Real-time subscription helpers
export const realtimeAPI = {
  // Subscribe to course changes
  subscribeToCourseChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('course-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to quiz changes
  subscribeToQuizChanges(courseId: string, callback: (payload: any) => void) {
    return supabase
      .channel('quiz-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quizzes',
          filter: `course_id=eq.${courseId}`
        },
        callback
      )
      .subscribe();
  },

  // Unsubscribe from a channel
  unsubscribe(subscription: any) {
    return supabase.removeChannel(subscription);
  }
};
