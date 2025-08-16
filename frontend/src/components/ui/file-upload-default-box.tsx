import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // Import React for React.ChangeEvent

interface FileUploadBoxProps {
  id: string; // Unique ID for the input and button reference
  accept: string; // e.g., ".pdf,.md" for the accept attribute
  fileTypesDescription: string; // e.g., "Upload .pdf or .md file"
  label: string; // Used for toast messages, e.g., "curriculum"
  onFileChange: (file: File | undefined) => void; // Callback when a file is selected (or cleared)
}

export const FileUploadBox: React.FC<FileUploadBoxProps> = ({
  id,
  accept,
  fileTypesDescription,
  label,
  onFileChange,
}) => {
  const { toast } = useToast();

  const handleInternalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = accept.split(',').map(type => type.trim());

    if (file && !allowedTypes.some(type => file.name.toLowerCase().endsWith(type))) {
      toast({
        title: 'Invalid file type',
        description: `Please upload a valid ${label} file (${allowedTypes.join(', ')})`,
        variant: 'destructive',
      });
      e.target.value = ''; // Clear the input to allow re-upload of same file
      onFileChange(undefined); // Indicate no valid file was uploaded
    } else {
      onFileChange(file); // Pass the selected file up to the parent component
    }
  };

  return (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
      <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">
        {fileTypesDescription}
      </p>
      <Button variant="outline" size="sm" onClick={() => document.getElementById(id)?.click()}>
        Choose File
      </Button>
      <Input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInternalFileChange}
      />
    </div>
  );
}; 