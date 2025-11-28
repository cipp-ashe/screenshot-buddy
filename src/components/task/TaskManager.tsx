
import { useState } from "react";
import { Task } from "@/types/task";
import { FilterBar } from "../filter/FilterBar";
import { TaskList } from "../TaskList";

type SortOption = "newest" | "oldest" | "updated";

interface TaskManagerProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  isProcessing?: boolean;
}

export const TaskManager = ({ tasks, onUpdateTask, isProcessing }: TaskManagerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Task["status"] | "all">("all");
  const [selectedTag, setSelectedTag] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Get unique tags from all tasks
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags)));

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchQuery === "" || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.notes?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    const matchesTag = selectedTag === "all" || task.tags.includes(selectedTag);

    return matchesSearch && matchesStatus && matchesTag;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        allTags={allTags}
      />
      
      {tasks.length === 0 ? (
        <div className="glass-morphism rounded-lg py-12 text-center text-muted-foreground responsive-padding">
          No tasks yet. Upload a screenshot to get started!
        </div>
      ) : isProcessing ? (
        <div className="glass-morphism rounded-lg py-12 text-center text-muted-foreground responsive-padding">
          Processing your image. Please wait...
        </div>
      ) : (
      <TaskList
        onUpdateTask={onUpdateTask}
        filteredTasks={sortedTasks}
      />
      )}
    </div>
  );
};
