
import { FC } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task } from "@/types/task";
import { useToast } from "@/components/ui/use-toast";

interface JsonViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
}

export const JsonViewDialog: FC<JsonViewDialogProps> = ({ open, onOpenChange, tasks }) => {
  const { toast } = useToast();

  const handleCopyJson = () => {
    const exportData = {
      tasks,
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast({
      title: "JSON copied to clipboard",
      description: "The task data has been copied to your clipboard",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Task Data (JSON)</span>
            <Button variant="outline" size="sm" onClick={handleCopyJson}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="scrollbar-hide max-h-[60vh] overflow-y-auto">
          <pre className="bg-secondary/20 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
            {JSON.stringify({ tasks, exportDate: new Date().toISOString(), version: "1.0" }, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};
