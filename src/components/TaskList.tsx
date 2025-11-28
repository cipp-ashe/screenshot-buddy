
import { Task } from "@/types/task";
import { useState } from "react";
import { TaskItem } from "./task/TaskItem";

interface TaskListProps {
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  filteredTasks: Task[];
}

export const TaskList = ({ onUpdateTask, filteredTasks }: TaskListProps) => {
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    onUpdateTask?.(taskId, updates);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {filteredTasks.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No tasks found matching your filters
        </div>
      ) : (
        filteredTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isOpen={openTaskId === task.id}
            onOpenChange={(open) => setOpenTaskId(open ? task.id : null)}
            onUpdateTask={handleUpdateTask}
          />
        ))
      )}
    </div>
  );
};
