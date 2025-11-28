
import { Task } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { TaskDetails } from "./TaskDetails";
import { EditableField } from "./EditableField";
import { format } from "date-fns";
import { TaskStatusBadge } from "./components/TaskStatusBadge";
import { TaskTags } from "./components/TaskTags";
import { TaskImagePreview } from "./components/TaskImagePreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";

interface TaskItemProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const TaskItem = ({ task, isOpen, onOpenChange, onUpdateTask }: TaskItemProps) => {
  const isMobile = useIsMobile();
  const [localIsOpen, setLocalIsOpen] = useState(isOpen);
  
  // Sync the local state with props
  useEffect(() => {
    setLocalIsOpen(isOpen);
  }, [isOpen]);
  
  const handleAddTag = (newTag: string) => {
    onUpdateTask(task.id, {
      tags: [...task.tags, newTag],
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTask(task.id, {
      tags: task.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // On mobile, we need to make sure users can easily expand cards
  const expandCardOnMobile = (e: React.MouseEvent) => {
    if (isMobile) {
      e.stopPropagation();
      const newOpenState = !localIsOpen;
      setLocalIsOpen(newOpenState);
      onOpenChange(newOpenState);
    }
  };

  return (
    <Card className="p-4 sm:p-6" onClick={expandCardOnMobile}>
      <Collapsible open={localIsOpen} onOpenChange={(state) => {
        setLocalIsOpen(state);
        onOpenChange(state);
      }}>
        <div className={`flex ${isMobile ? 'flex-col' : 'items-start'} gap-4 md:gap-6`}>
          <div className="flex-1 min-w-0 w-full">
            <div className="flex items-start gap-2">
              <CollapsibleTrigger className={cn(
                "h-6 w-6 flex-shrink-0 flex items-center justify-center rounded-md hover:bg-secondary/20 mt-1",
                isMobile && "h-8 w-8" // Larger touch target on mobile
              )}>
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform", 
                    localIsOpen && "rotate-90",
                    isMobile && "h-5 w-5" // Larger icon on mobile
                  )} 
                />
              </CollapsibleTrigger>
              
              <div className="flex-1 min-w-0 w-full space-y-2">
                <div className="w-full">
                  <EditableField
                    task={task}
                    field="title"
                    value={task.title}
                    onUpdate={onUpdateTask}
                  />
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <TaskStatusBadge 
                    status={task.status} 
                    onStatusChange={(status) => onUpdateTask(task.id, { status })}
                  />
                  {task.imageType && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {task.imageType}
                    </Badge>
                  )}
                  <TaskTags
                    tags={task.tags}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                  />
                </div>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mt-1 ml-8">
              Created {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
              {task.updatedAt > task.createdAt && 
                ` · Updated ${format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}`
              }
            </div>

            <div className="ml-8 mt-2 break-words">
              <EditableField
                task={task}
                field="description"
                value={task.description}
                onUpdate={onUpdateTask}
              />
            </div>
          </div>

          {task.imageUrl && (
            <TaskImagePreview
              imageUrl={task.imageUrl}
              fileName={task.fileName}
            />
          )}
        </div>

        <CollapsibleContent className="space-y-4 mt-4">
          <TaskDetails task={task} onUpdateTask={onUpdateTask} />
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
