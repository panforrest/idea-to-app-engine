import { useRef } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import IdeaInputSection from "@/components/IdeaInputSection";
import FeaturesSection from "@/components/FeaturesSection";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    const generatorSection = document.getElementById("generator");
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleIdeaSubmit = (idea: string) => {
    console.log("Idea submitted:", idea);
    toast({
      title: "Idea received!",
      description: "AI analysis will be available in the next step. Let's set up the backend first!",
    });
    // This will be connected to AI analysis in next step
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onGetStarted={scrollToGenerator} />
      
      <main>
        <HeroSection onGetStarted={scrollToGenerator} />
        
        <div ref={generatorRef}>
          <IdeaInputSection onSubmit={handleIdeaSubmit} />
        </div>
        
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
