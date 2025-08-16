import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadBoxBigProps {
  id: string;
  label: string;
  fileTypesText: string;
  allowedTypes: string[];
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, allowedTypes: string[], label: string) => void;
  optional?: boolean; // New prop to indicate if it's optional
}

export function UploadBoxBig({ id, label, fileTypesText, allowedTypes, onFileChange, optional = false }: UploadBoxBigProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-file`}>
        {label} 
        {!optional && <span className="text-red-500"> *</span>}
      </Label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
        <Upload className="h-8 w-8 text-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-2">
          {fileTypesText}
        </p>
        <Button variant="outline" size="sm" onClick={() => document.getElementById(`${id}-file`)?.click()}>
          Choose File
        </Button>
        <Input 
          id={`${id}-file`} 
          type="file" 
          accept={allowedTypes.join(',')} 
          className="hidden" 
          onChange={e => onFileChange(e, allowedTypes, label)} 
        />
      </div>
    </div>
  );
} 