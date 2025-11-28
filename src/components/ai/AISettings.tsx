import { FC, useState } from "react";
import { useBYOAI, getAllProviders } from "@/lib/byoai";
import { BYOAI_CONFIG } from "@/lib/byoai/config";
import { HelpAccordion } from "./HelpAccordion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AISettingsProps {
  className?: string;
}

/**
 * AI Settings UI - Simplified to API key management only
 */
export const AISettings: FC<AISettingsProps> = ({ className }) => {
  const ai = useBYOAI(BYOAI_CONFIG);
  
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSave = async () => {
    if (!apiKey) {
      toast.error('Please enter your API key');
      return;
    }

    const result = await ai.saveApiKey(apiKey);
    if (result.success) {
      toast.success('API key saved securely');
      setApiKey('');
    } else {
      toast.error(result.error || 'Failed to save API key');
    }
  };

  const handleRemove = () => {
    if (confirm('Remove your stored API key?')) {
      ai.removeApiKey();
      toast.success('API key removed');
    }
  };

  const keyInfo = ai.getApiKeyInfo();

  return (
    <div className={className}>
      <div className="space-y-6 p-1">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                By default, the app uses a native AI service. Optionally provide your own {ai.provider?.config.name} API key for enhanced control.
              </p>
              
              {getAllProviders().length > 1 && (
                <div className="space-y-2 mb-4">
                  <Label>AI Provider</Label>
                  <select 
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={ai.provider?.config.id || ''}
                    onChange={(e) => ai.changeProvider(e.target.value)}
                  >
                    {getAllProviders().map(p => (
                      <option key={p.config.id} value={p.config.id}>
                        {p.config.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {ai.provider?.config.description}
                  </p>
                </div>
              )}
            </div>

            {ai.hasApiKey ? (
              <div className="space-y-4">
                {keyInfo?.isExpired && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your API key encryption may have expired. Consider re-saving it to ensure secure storage.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium text-green-600">API key is active</div>
                      {keyInfo && (
                        <div className="text-sm text-muted-foreground">
                          Saved: {new Date(keyInfo.timestamp).toLocaleDateString()}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRemove}
                        className="mt-2"
                      >
                        Remove API Key
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    Your API key will be encrypted and stored securely in your browser.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input
                      type={showKey ? "text" : "password"}
                      placeholder={`Enter ${ai.provider?.config.name} API key`}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {ai.provider?.config.keyFormat && (
                    <p className="text-sm text-muted-foreground">
                      Format: {ai.provider.config.keyFormat}
                    </p>
                  )}
                  {ai.provider?.config.apiKeyUrl && (
                    <a
                      href={ai.provider.config.apiKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Get your API key →
                    </a>
                  )}
                </div>

                <Button onClick={handleSave} className="w-full">
                  Save API Key
                </Button>
              </div>
            )}
          </div>
        </Card>
        
        <div className="border-t pt-4">
          <HelpAccordion />
        </div>
        
        <div className="border-t pt-4">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (confirm('Reset all AI settings? This will remove your API key and provider configuration.')) {
                ai.clearAllData();
                toast.success('AI settings reset successfully');
              }
            }}
          >
            Reset AI Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
