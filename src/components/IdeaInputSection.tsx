import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface IdeaInputSectionProps {
  onSubmit: (idea: string) => void;
  isLoading?: boolean;
}

const exampleIdeas = [
  "A premium AI tattoo design service for $199 per custom design",
  "SaaS dashboard for social media analytics at $49/month",
  "E-book marketplace for indie authors with 70% royalty split",
  "Online consulting platform for business mentors at $500/hour",
];

const IdeaInputSection = ({ onSubmit, isLoading = false }: IdeaInputSectionProps) => {
  const [idea, setIdea] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setIdea(example);
  };

  return (
    <section id="generator" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="container relative z-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-foreground">Describe Your </span>
              <span className="text-primary text-glow">Startup Idea</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Our AI will analyze your idea and generate a complete, monetizable app
            </p>
          </motion.div>

          {/* Input form */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="relative">
              <div className="rounded-xl border-2 border-primary/30 hover:border-primary/50 transition-colors">
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Describe your startup idea in detail... What problem does it solve? Who is your target customer? How will you monetize it?"
                  className="min-h-[160px] bg-card/80 backdrop-blur-sm border-0 rounded-xl text-lg p-6 resize-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                  disabled={isLoading}
                />
              </div>
              
              {/* Character count */}
              <div className="absolute bottom-4 right-4 text-sm text-muted-foreground pointer-events-none">
                {idea.length} / 500
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              size="lg"
              disabled={!idea.trim() || isLoading}
              className="w-full py-6 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-primary transition-all duration-300 disabled:opacity-50 disabled:glow-none"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing & Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate My App
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </motion.form>

          {/* Example ideas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <p className="text-sm text-muted-foreground text-center mb-4">
              Try an example:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {exampleIdeas.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm rounded-full bg-secondary/50 border border-border hover:bg-secondary hover:border-primary/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {example.length > 40 ? example.substring(0, 40) + "..." : example}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default IdeaInputSection;
