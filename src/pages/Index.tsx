import { useState, useEffect } from "react";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { TaskManager } from "@/components/task/TaskManager";
import { Header } from "@/components/header/Header";
import { JsonViewDialog } from "@/components/dialog/JsonViewDialog";
import { TaskActions } from "@/components/task/TaskActions";
import { useBYOAI, createImageAnalysisOptions } from "@/lib/byoai";
import { BYOAI_CONFIG } from "@/lib/byoai/config";
import { analyzeWithNativeAI, TASK_PROMPT, parseTaskResponse, type TaskAnalysisResult } from "@/utils/nativeAI";
import { validateImage, sanitizeFileName, secureRandomId } from "@/utils/security";

const STORAGE_KEY = "screenshot-tasks";
const STORAGE_VERSION = "1.0";

const Index = () => {
  const byoai = useBYOAI(BYOAI_CONFIG);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return [];

      const parsed = JSON.parse(savedData);
      
      if (parsed.version !== STORAGE_VERSION) {
        console.warn('Invalid storage version, resetting data');
        return [];
      }

      return parsed.tasks.map((task: any) => ({
        id: typeof task.id === 'string' ? task.id : secureRandomId(),
        title: typeof task.title === 'string' ? task.title.slice(0, 100) : 'Untitled',
        description: typeof task.description === 'string' ? task.description : '',
        status: ['todo', 'in-progress', 'done'].includes(task.status) ? task.status : 'todo',
        imageUrl: typeof task.imageUrl === 'string' ? task.imageUrl : undefined,
        imageType: ['screenshot', 'image', null].includes(task.imageType) ? task.imageType : null,
        fileName: typeof task.fileName === 'string' ? sanitizeFileName(task.fileName) : undefined,
        capturedText: typeof task.capturedText === 'string' ? task.capturedText : undefined,
        tags: Array.isArray(task.tags) ? task.tags.filter((tag: any) => typeof tag === 'string') : [],
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      }));
    } catch (e) {
      console.error("Error loading saved tasks:", e);
      return [];
    }
  });
  
  const [showJsonDialog, setShowJsonDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks,
        version: STORAGE_VERSION,
        lastUpdated: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Error saving tasks:", e);
      toast({
        title: "Error saving tasks",
        description: "There was an error saving your tasks. Please try clearing some space in your browser storage.",
        variant: "destructive",
      });
    }
  }, [tasks, toast]);

  const handleImageUpload = async (
    imageData: string,
    fileName?: string,
    type?: "screenshot" | "image"
  ) => {
    try {
      setIsProcessing(true);
      
      console.log("[Image Upload] Starting image processing");
      
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      const validation = validateImage(blob);
      if (!validation.isValid) {
        toast({
          title: "Invalid image",
          description: validation.error,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const sanitizedFileName = fileName ? sanitizeFileName(fileName) : undefined;

      toast({
        title: "Processing image...",
        description: "Please wait while we analyze your image.",
      });

      // Create a unique ID for the task
      const taskId = secureRandomId();

      // Create a basic task immediately with the image
      const basicTask: Task = {
        id: taskId,
        title: "Processing Image...",
        description: "We're analyzing this image. The details will update shortly.",
        status: "todo",
        imageUrl: imageData,
        imageType: type || null,
        fileName: sanitizedFileName,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add the basic task to the list immediately
      setTasks((prev) => [basicTask, ...prev]);
      
      try {
        console.log("[Image Upload] Analyzing image");
        
        // Decide which AI path to use
        let analysis: TaskAnalysisResult;
        
        if (byoai.hasApiKey) {
          // User has configured their own API key - use BYOAI
          console.log("[Image Upload] Using custom API key via BYOAI");
          
          // Show analyzing state
          toast({
            title: "Analyzing with your AI provider...",
            description: "Please wait while we process your image.",
          });
          
          analysis = await byoai.call(
            createImageAnalysisOptions(imageData, TASK_PROMPT, parseTaskResponse)
          );
        } else {
          // No API key - use native worker
          console.log("[Image Upload] Using native AI worker");
          analysis = await analyzeWithNativeAI(imageData);
        }
        
        console.log("[Image Upload] Received analysis:", analysis);

        // Update the task with the analysis results
        setTasks((prev) => prev.map(task => 
          task.id === taskId ? {
            ...task,
            title: analysis.title,
            description: analysis.description,
            capturedText: analysis.capturedText,
            updatedAt: new Date()
          } : task
        ));

        toast({
          title: "Image processed successfully",
          description: "Your task has been created with the image details.",
        });
      } catch (analysisError) {
        console.error("Error in image analysis:", analysisError);
        
        // Provide specific feedback based on error type
        const errorMessage = analysisError instanceof Error ? analysisError.message : String(analysisError);
        
        let description = "We've created your task, but couldn't fully analyze the image. You can edit the details manually.";
        let variant: "default" | "destructive" = "default";
        
        if (errorMessage.includes('Authentication failed') || errorMessage.includes('API key may be invalid')) {
          description = "Your API key appears to be invalid. Please check your AI settings and try again.";
          variant = "destructive";
        } else if (errorMessage.includes('Unexpected API response')) {
          description = "The AI service returned an unexpected response. Please try again.";
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          description = "The request took too long. Please try again with a smaller image.";
        }
        
        toast({
          title: "Analysis incomplete",
          description,
          variant,
        });
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error processing image",
        description: "There was a problem processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all tasks? This cannot be undone.")) {
      setTasks([]);
      toast({
        title: "All tasks cleared",
        description: "Your task list has been reset",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container section-padding space-y-6 md:space-y-8">
        <Header onImageUpload={handleImageUpload} />
        
        {byoai.isLoading && (
          <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground animate-pulse">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-ping"></span>
              Using {byoai.provider?.config.name} to analyze image...
            </span>
          </div>
        )}

        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Task List</h2>
            <TaskActions 
              tasks={tasks}
              onShowJsonDialog={() => setShowJsonDialog(true)}
              onClearAll={handleClearAll}
            />
          </div>
          <TaskManager 
            tasks={tasks} 
            onUpdateTask={handleUpdateTask}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      <JsonViewDialog
        open={showJsonDialog}
        onOpenChange={setShowJsonDialog}
        tasks={tasks}
      />
    </div>
  );
};

export default Index;
