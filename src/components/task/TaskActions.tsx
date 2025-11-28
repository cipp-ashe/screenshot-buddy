
import { FC } from "react";
import { Download, Trash2, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";

interface TaskActionsProps {
  tasks: Task[];
  onShowJsonDialog: () => void;
  onClearAll: () => void;
}

export const TaskActions: FC<TaskActionsProps> = ({ tasks, onShowJsonDialog, onClearAll }) => {
  const { toast } = useToast();

  const handleDownload = () => {
    let markdownContent = `# Screenshot Task Manager Export\n\nExported on: ${new Date().toLocaleString()}\n\n`;
    
    tasks.forEach((task) => {
      markdownContent += `## ${task.title}\n\n`;
      markdownContent += `- Status: ${task.status}\n`;
      markdownContent += `- Created: ${task.createdAt.toLocaleString()}\n`;
      markdownContent += `- Updated: ${task.updatedAt.toLocaleString()}\n`;
      if (task.dueDate) markdownContent += `- Due: ${task.dueDate.toLocaleString()}\n`;
      if (task.tags.length > 0) markdownContent += `- Tags: ${task.tags.join(', ')}\n`;
      markdownContent += `\n${task.description}\n\n`;
      if (task.notes) markdownContent += `Notes:\n${task.notes}\n\n`;
      if (task.imageUrl) markdownContent += `[Image: ${task.fileName || 'Screenshot'}]\n\n`;
      markdownContent += `---\n\n`;
    });
    
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "screenshot-tasks-export.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Tasks exported successfully",
      description: "Your tasks have been downloaded as a Markdown file",
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onShowJsonDialog}
        disabled={tasks.length === 0}
      >
        <FileJson className="h-4 w-4 mr-2" />
        View JSON
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleDownload}
        disabled={tasks.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        Export MD
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onClearAll}
        disabled={tasks.length === 0}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Clear All
      </Button>
    </div>
  );
};
