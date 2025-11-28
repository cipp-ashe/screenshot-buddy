
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useState } from "react";

interface TaskImagePreviewProps {
  imageUrl: string;
  fileName?: string;
}

export const TaskImagePreview = ({ imageUrl, fileName }: TaskImagePreviewProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowImageDialog(true)}
        className="relative w-32 h-32 shrink-0 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow group"
      >
        <img
          src={imageUrl}
          alt={fileName || "Task image"}
          className="w-full h-full object-cover bg-secondary/20 group-hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
            View Image
          </span>
        </div>
      </button>

      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <button
              onClick={() => setShowImageDialog(false)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <img
              src={imageUrl}
              alt={fileName || "Task image"}
              className="w-full h-full object-contain max-h-[90vh]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
