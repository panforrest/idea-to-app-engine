import { motion } from "framer-motion";
import { Sparkles, Zap, DollarSign, BarChart3, Palette, Globe } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Analysis",
    description: "Describe your idea in plain English. Our AI extracts product type, target audience, and optimal pricing strategy.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Watch as your complete app materializes in seconds. Dynamic templates matched to your unique business model.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: DollarSign,
    title: "Built-in Payments",
    description: "Every app comes with Flowglad-powered checkout. One-time, subscription, or usage-based - we handle it all.",
    color: "text-money",
    bgColor: "bg-money/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track views, conversions, and revenue from your dashboard. Know exactly how your apps perform.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Palette,
    title: "Smart Theming",
    description: "AI generates cohesive color schemes and styling that match your brand vision automatically.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Instant Deploy",
    description: "Every generated app gets its own live URL. Share with customers immediately, no setup required.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

const FeaturesSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container relative z-10 px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">How </span>
            <span className="text-primary text-glow">FlowGladiator</span>
            <span className="text-foreground"> Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to revenue in three simple steps. Our AI handles the complexity so you can focus on your vision.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="glass rounded-2xl p-6 h-full transition-all duration-300 hover:bg-card/80 hover:border-primary/30">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Process steps */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-success to-money hidden md:block" />
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Describe", desc: "Share your startup idea", color: "text-primary" },
                { step: "02", title: "Generate", desc: "AI builds your app", color: "text-success" },
                { step: "03", title: "Monetize", desc: "Start earning revenue", color: "text-money" },
              ].map((item, index) => (
                <div key={item.step} className="text-center relative">
                  <div className={`w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto mb-4 relative z-10`}>
                    <span className={`text-2xl font-bold ${item.color}`}>{item.step}</span>
                  </div>
                  <h4 className={`text-xl font-semibold ${item.color} mb-2`}>{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
