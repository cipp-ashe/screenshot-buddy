
import { FC } from "react";
import { Settings } from "lucide-react";
import { ScreenshotUpload } from "@/components/ScreenshotUpload";
import { AISettings } from "@/components/ai/AISettings";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  onImageUpload: (imageData: string, fileName?: string, type?: "screenshot" | "image") => void;
}

export const Header: FC<HeaderProps> = ({ onImageUpload }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <img
            src="/logo.svg"
            alt="Screenshot Task Manager Logo"
            width={isMobile ? "32" : "40"}
            height={isMobile ? "32" : "40"}
            className="flex-shrink-0 mt-1"
          />
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Screenshot Task Manager
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload screenshots and convert them into actionable tasks
            </p>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mt-2 sm:mt-0">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col p-0 max-h-screen">
            <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AISettings />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Upload Screenshot</h2>
          <ScreenshotUpload onImageUpload={onImageUpload} />
        </div>

        <div className="py-3 sm:py-4 px-4 sm:px-6 rounded-lg bg-secondary/20 flex flex-col justify-center">
          <div className="space-y-2 sm:space-y-3 text-sm text-muted-foreground">
            <p className="font-medium">How to use:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Upload screenshots or images (up to 5MB)</li>
              <li>AI analysis automatically generates task details</li>
              <li>{isMobile ? "Use camera or gallery to upload images" : "Paste screenshots directly (Ctrl+V / Cmd+V)"}</li>
              <li>Edit task details and add tags to organize your work</li>
              <li>Tasks are saved in your browser's local storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
