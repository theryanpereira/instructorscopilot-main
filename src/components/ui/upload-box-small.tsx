import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadBoxSmallProps {
  id: string;
  label: string;
  fileTypesText: string;
  allowedTypes: string[];
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, allowedTypes: string[], label: string) => void;
  optional?: boolean;
}

export function UploadBoxSmall({ id, label, fileTypesText, allowedTypes, onFileChange, optional = false }: UploadBoxSmallProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`${id}-file`}>
        {label}
        {!optional && <span className="text-red-500"> *</span>}
      </Label>
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-2 flex items-center gap-2">
        <Upload className="h-5 w-5 text-foreground flex-shrink-0" />
        <Button variant="outline" size="sm" onClick={() => document.getElementById(`${id}-file`)?.click()} className="flex-shrink-0">
          Choose File
        </Button>
        <p className="text-sm text-muted-foreground truncate">
          {fileTypesText}
        </p>
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