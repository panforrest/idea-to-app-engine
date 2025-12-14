import { motion } from "framer-motion";
import { Zap, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onGetStarted: () => void;
}

const Navbar = ({ onGetStarted }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass-strong border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:glow-primary transition-all duration-300">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-foreground">Flow</span>
                <span className="text-primary">Gladiator</span>
              </span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Generator
              </a>
              {user && (
                <button
                  onClick={() => navigate("/history")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  History
                </button>
              )}
              <button
                onClick={() => navigate("/pricing")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              {user ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAuthClick}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAuthClick}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border/50"
            >
              <div className="flex flex-col gap-4">
                <a href="#generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Generator
                </a>
                {user && (
                  <button
                    onClick={() => navigate("/history")}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    History
                  </button>
                )}
                <button
                  onClick={() => navigate("/pricing")}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                >
                  Pricing
                </button>
                <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </a>
                {user ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAuthClick}
                    className="w-full gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleAuthClick}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
