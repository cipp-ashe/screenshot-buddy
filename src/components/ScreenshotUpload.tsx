
import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Camera } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface ScreenshotUploadProps {
  onImageUpload: (imageData: string, fileName?: string, type?: "screenshot" | "image") => void;
}

export const ScreenshotUpload = ({ onImageUpload }: ScreenshotUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (!file) continue;

          processFile(file, "screenshot");
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onImageUpload, toast]
  );

  const processFile = (file: File, type: "screenshot" | "image" = "image") => {
    if (!file || !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        onImageUpload(event.target.result, file.name, type);
        toast({
          title: type === "screenshot" ? "Screenshot uploaded" : "Image uploaded",
          description: `Your ${type} "${file.name}" has been successfully uploaded.`,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    // Only add paste event listener on desktop
    if (!isMobile) {
      document.addEventListener("paste", handlePaste);
      return () => {
        document.removeEventListener("paste", handlePaste);
      };
    }
  }, [handlePaste, isMobile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onImageUpload, toast]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      // On mobile, trigger the file input
      fileInputRef.current?.click();
    } else {
      // On desktop, show paste instructions
      setIsActive(true);
      toast({
        title: "Ready for paste",
        description: "Press Ctrl+V (Cmd+V on Mac) to paste your screenshot.",
      });
      setTimeout(() => setIsActive(false), 3000);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const mobileTriggerCamera = () => {
    // Trigger device camera
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("capture", "environment");
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      className={`p-4 sm:p-8 border-2 border-dashed transition-all duration-200 ${
        isDragging ? "border-primary bg-primary/5" : isActive ? "border-primary" : "border-border"
      } rounded-lg cursor-pointer`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <div className="flex flex-col items-center justify-center gap-4 text-center animate-fade-up">
        {isDragging ? (
          <Upload className="w-12 h-12 text-primary animate-bounce" />
        ) : isMobile ? (
          <div className="flex flex-col items-center gap-4">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
            <div className="flex gap-3 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="w-4 h-4" />
                <span>Gallery</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  mobileTriggerCamera();
                }}
              >
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </Button>
            </div>
          </div>
        ) : (
          <ImageIcon className="w-12 h-12 text-muted-foreground" />
        )}
        
        {!isMobile && (
          <div>
            <p className="text-lg font-medium">
              {isActive 
                ? "Ready to paste! (Ctrl+V / Cmd+V)"
                : "Click here to paste or drop image files"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports: Screenshots (via paste) and image files (via drag & drop)
            </p>
          </div>
        )}
        
        {isMobile && (
          <p className="text-sm text-muted-foreground mt-1">
            Tap to upload from gallery or take a photo
          </p>
        )}
      </div>
    </Card>
  );
};
