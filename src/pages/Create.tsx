import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizBuilder } from "@/components/quiz/QuizBuilder";
import { PersonalizedGenerator } from "@/components/content/PersonalizedGenerator";
import { DiffViewer } from "@/components/content/DiffViewer";
import { ShareablePreview } from "@/components/sharing/ShareablePreview";
import { ReviewerAccess } from "@/components/collaboration/ReviewerAccess";

const Create = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h1 className="text-3xl font-bold">Course Creator</h1>
        {/* <Badge variant="secondary" className="ml-2">Phase 2</Badge> */}
      </div>
      
      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generator">Course Generation</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Builder</TabsTrigger>
          <TabsTrigger value="diff">Version Compare</TabsTrigger>
          <TabsTrigger value="share">Share & Preview</TabsTrigger>
          <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator">
          <PersonalizedGenerator />
        </TabsContent>
        
        <TabsContent value="quiz">
          <QuizBuilder />
        </TabsContent>
        
        <TabsContent value="diff">
          <DiffViewer />
        </TabsContent>
        
        <TabsContent value="share">
          <ShareablePreview />
        </TabsContent>
        
        <TabsContent value="collaborate">
          <ReviewerAccess />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Create;