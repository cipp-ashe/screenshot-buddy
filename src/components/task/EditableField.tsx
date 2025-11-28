
import { Task } from "@/types/task";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditableFieldProps {
  task: Task;
  field: string;
  value: any;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export const EditableField = ({ task, field, value, onUpdate }: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (newValue: any) => {
    onUpdate(task.id, { [field]: newValue });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        className="group relative cursor-pointer hover:bg-secondary/20 rounded-md py-1 px-2 flex items-center gap-2 w-full"
        onClick={() => setIsEditing(true)}
      >
        {field === "description" || field === "notes" ? (
          <div className="flex-1 w-full">
            <p className={`text-muted-foreground whitespace-pre-wrap break-words ${!value ? 'italic' : ''}`}>
              {value || `Add ${field}...`}
            </p>
          </div>
        ) : field === "title" ? (
          <span className="flex-1 break-words font-medium text-foreground leading-relaxed">
            {value}
          </span>
        ) : (
          <span className="flex-1 break-words">{value}</span>
        )}
        <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    );
  }

  if (field === "description" || field === "notes") {
    return (
      <Textarea
        autoFocus
        defaultValue={value}
        onBlur={(e) => handleSubmit(e.target.value)}
        className="mt-1 min-h-[120px] resize-y"
        placeholder={`Add ${field}...`}
      />
    );
  }

  return (
    <Input
      autoFocus
      defaultValue={value}
      onBlur={(e) => handleSubmit(e.target.value)}
      className="mt-1"
    />
  );
};
