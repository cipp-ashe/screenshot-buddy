
import { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const HelpAccordion: FC = () => {
  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="usage">
          <AccordionTrigger>Using AI Features</AccordionTrigger>
          <AccordionContent>
            <div className="rounded-lg bg-accent/5 p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Getting Started</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Choose between Native AI or Custom API key</li>
                  <li>Native AI uses a shared service (no configuration needed)</li>
                  <li>Custom mode requires your own AI provider API key</li>
                  <li>Upload images to use AI analysis with either option</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">API Usage</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Automatic image analysis</li>
                  <li>Smart title suggestions</li>
                  <li>Detailed description generation</li>
                  <li>Text extraction from screenshots</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">For custom API keys, check your provider's dashboard for quotas and usage</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="security">
          <AccordionTrigger>Security & Privacy Policy</AccordionTrigger>
          <AccordionContent>
            <div className="rounded-lg bg-accent/5 p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Data Storage</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>All data stored locally in your browser</li>
                  <li>Data persists between sessions unless cleared</li>
                  <li>No data sent to external servers except for AI analysis</li>
                  <li>Regular backups recommended using export feature</li>
                  <li>Version-controlled storage prevents data corruption</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Privacy Protection</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Images analyzed locally before AI processing</li>
                  <li>Native AI processing done via secure Cloudflare Worker</li>
                  <li>Custom API keys encrypted and stored securely in browser only</li>
                  <li>No tracking or analytics implemented</li>
                  <li>Clear browser data to remove all stored information</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Image Security</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>File size limit: 5MB maximum</li>
                  <li>Allowed formats: JPEG, PNG, GIF, WebP</li>
                  <li>File type validation before processing</li>
                  <li>Filename sanitization to prevent path traversal</li>
                  <li>Base64 encoding for secure image data handling</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="comparison">
          <AccordionTrigger>AI Service Options</AccordionTrigger>
          <AccordionContent>
            <div className="rounded-lg bg-accent/5 p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Native AI Service</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>No configuration needed</li>
                  <li>Zero cost to you</li>
                  <li>Shared service with possible rate limiting</li>
                  <li>Uses secure Cloudflare Worker</li>
                  <li>Less control over model parameters</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Custom API Key</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Requires your own AI provider API key</li>
                  <li>Subject to your provider's pricing and quotas</li>
                  <li>More reliable during high usage periods</li>
                  <li>Complete control over your usage</li>
                  <li>Direct integration with your chosen provider</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tips">
          <AccordionTrigger>Best Practices</AccordionTrigger>
          <AccordionContent>
            <div className="rounded-lg bg-accent/5 p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Recommended Habits</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Regularly clear stored API keys when not in use</li>
                  <li>Export and backup your data periodically</li>
                  <li>Review browser storage settings occasionally</li>
                  <li>If using custom keys, monitor your API usage in your provider's dashboard</li>
                  <li>Keep your API key private and secure</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
