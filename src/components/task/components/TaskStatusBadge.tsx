
import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, RefreshCcw } from "lucide-react";

interface TaskStatusBadgeProps {
  status: Task["status"];
  onStatusChange: (status: Task["status"]) => void;
}

const statusIcons = {
  todo: Clock,
  "in-progress": RefreshCcw,
  done: CheckCircle2,
};

const statusColors = {
  todo: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

export const TaskStatusBadge = ({ status, onStatusChange }: TaskStatusBadgeProps) => {
  const StatusIcon = statusIcons[status];

  return (
    <Badge
      variant="secondary"
      className={`${statusColors[status]} capitalize cursor-pointer shrink-0`}
      onClick={() => {
        const nextStatus = {
          todo: "in-progress",
          "in-progress": "done",
          done: "todo",
        }[status] as Task["status"];
        onStatusChange(nextStatus);
      }}
    >
      <StatusIcon className="w-3 h-3 mr-1" />
      {status.replace("-", " ")}
    </Badge>
  );
};
