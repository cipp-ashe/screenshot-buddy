
export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  imageUrl?: string;
  imageType: "screenshot" | "image" | null;
  fileName?: string;
  notes?: string;
  capturedText?: string;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

