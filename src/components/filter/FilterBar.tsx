
import { Search, ArrowUpDown, Tag } from "lucide-react";
import { Task } from "@/types/task";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SortOption = "newest" | "oldest" | "updated";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: Task["status"] | "all";
  setSelectedStatus: (status: Task["status"] | "all") => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  selectedTag: string | "all";
  setSelectedTag: (tag: string) => void;
  allTags: string[];
}

export const FilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  selectedTag,
  setSelectedTag,
  allTags,
}: FilterBarProps) => {
  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={selectedStatus}
          onValueChange={(value: Task["status"] | "all") => setSelectedStatus(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(value: SortOption) => setSortBy(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <ArrowUpDown className="h-4 w-4" />
                New
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <ArrowUpDown className="h-4 w-4" />
                Old
              </div>
            </SelectItem>
            <SelectItem value="updated">
              <div className="flex items-center gap-2 text-sm whitespace-nowrap">
                <ArrowUpDown className="h-4 w-4" />
                Updated
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={selectedTag}
          onValueChange={(value: string) => setSelectedTag(value)}
          disabled={allTags.length === 0}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                All Tags
              </div>
            </SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {tag}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
