import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Spinner } from "../components/ui/spinner";
import { motion } from "motion/react";
import { ArrowUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onAnalysis: (repoUrl: string) => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onAnalysis, loading }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "The Code Fable...";

  useEffect(() => {
      let index = 0;
      const intervalId = setInterval(() => {
        setTypedText(fullText.slice(0, index + 1));
        index++;
        if (index >= fullText.length) {
          clearInterval(intervalId);
        }
      }, 150);
      return () => clearInterval(intervalId);
  }, []);

  const handleAnalysis = () => {
    if (repoUrl.trim()) {
      onAnalysis(repoUrl);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleAnalysis();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-4 h-full">
      <div className="w-full max-w-3xl mb-20 space-y-8">
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="text-center space-y-6"
           >
             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-secondary-foreground font-marker -rotate-2 tape px-6 py-2 bg-secondary sketch-shadow inline-block">
                <span>
                    {typedText}
                </span>
                <motion.span 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-12 align-middle bg-primary ml-1 rough-border"
                />
             </h1>
             <p className="text-foreground text-3xl font-hand font-bold rotate-1 mt-6">
               Paste the repo link below, and let the story unfold.
             </p>
           </motion.div>

        <motion.div
          layout
          className={cn(
            "relative rounded-full transition-all duration-300",
            isFocused ? "ring-2 ring-primary/20" : "hover:shadow-sm"
          )}
        >
          
          <div className="relative flex items-center bg-card p-3 pl-6 rough-border sketch-shadow rotate-1 tape-top">
            <Sparkles className={cn("w-6 h-6 text-primary mr-2 transition-opacity -rotate-12", isFocused ? "opacity-100" : "opacity-70")} />
            
            <Input
              id="repoUrl"
              placeholder="https://github.com/..."
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={loading}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none placeholder:text-muted-foreground py-4 text-xl font-mono font-bold tracking-wide text-foreground"
            />
            
            <div className="flex justify-end pr-1">
              <Button
                onClick={handleAnalysis}
                disabled={loading || !repoUrl.trim()}
                size="icon"
                className={cn(
                  "h-12 w-12 transition-all duration-300 rough-border sketch-shadow -rotate-2",
                  repoUrl.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-110" : "bg-muted text-muted-foreground"
                )}
              >
                {loading ? (
                  <Spinner className="w-6 h-6" />
                ) : (
                  <ArrowUp className="w-6 h-6" strokeWidth={3} />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatInput;
