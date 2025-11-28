
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";

interface TaskTagsProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const TaskTags = ({ tags, onAddTag, onRemoveTag }: TaskTagsProps) => {
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = (tagText: string) => {
    const newTag = tagText.trim();
    if (newTag && !tags.includes(newTag)) {
      onAddTag(newTag);
    }
    setIsAddingTag(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).textContent) {
      handleAddTag((e.target as HTMLElement).textContent);
    }
    if (e.key === "Escape") {
      setIsAddingTag(false);
    }
  };

  return (
    <>
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-xs group">
          {tag}
          <button
            onClick={() => onRemoveTag(tag)}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      {isAddingTag ? (
        <span
          role="textbox"
          contentEditable
          onBlur={(e) => handleAddTag(e.target.textContent || "")}
          onKeyDown={handleKeyDown}
          className="min-w-[60px] px-2 py-0.5 bg-secondary text-xs rounded-md focus:outline-none focus:ring-1 focus:ring-accent"
          autoFocus
        />
      ) : (
        <Badge 
          variant="outline" 
          className="text-xs cursor-pointer hover:bg-secondary/50"
          onClick={() => setIsAddingTag(true)}
        >
          + Add tag
        </Badge>
      )}
    </>
  );
};
