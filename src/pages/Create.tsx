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
      {/* Removed Course Creator header */}
      <PersonalizedGenerator />
    </div>
  );
};

export default Create;