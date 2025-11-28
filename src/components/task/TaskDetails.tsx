
import { Task } from "@/types/task";
import { EditableField } from "./EditableField";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TaskDetailsProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

export const TaskDetails = ({ task, onUpdateTask }: TaskDetailsProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`space-y-4 ${isMobile ? 'pl-2' : 'pl-8'}`}>
      {task.capturedText && (
        <Card className="p-4 bg-secondary/5 border-secondary/20">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="h-4 w-4 text-accent" />
              <span>Captured Text</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
              {task.capturedText || "No text captured from this image."}
            </div>
          </div>
        </Card>
      )}

      {task.capturedText && <Separator className="my-4" />}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Notes</label>
        <ScrollArea className="h-full max-h-[300px] rounded-md border bg-card p-4">
          <EditableField
            task={task}
            field="notes"
            value={task.notes || ""}
            onUpdate={onUpdateTask}
          />
        </ScrollArea>
      </div>

      {task.fileName && (
        <div className="text-xs text-muted-foreground mt-2">
          File: {task.fileName}
        </div>
      )}
    </div>
  );
};
