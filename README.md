# FlowGladiator 🚀

**AI-Powered Startup Idea Analyzer & App Generator**

> Turn your startup idea into a complete, revenue-ready app with AI-powered generation and built-in payments.

Built for the **FlowGlad Vibe Coding Hackathon 2024** 🏆

![FlowGladiator](https://img.shields.io/badge/FlowGladiator-AI%20Powered-cyan)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![FlowGlad](https://img.shields.io/badge/FlowGlad-Payments-orange)

---

## ✨ Features

### 🧠 AI Idea Analysis
- **Instant viability scoring** - Get a 0-100 score on your startup idea's potential
- **Market analysis** - Understand market potential (low/medium/high)
- **Strengths & challenges** - AI-identified pros and cons
- **Target audience identification** - Know your ideal customers
- **Revenue model suggestions** - Monetization strategies tailored to your idea
- **Actionable next steps** - Clear roadmap to move forward

### 🎨 AI App Preview Generator
- **Visual app mockups** - See your app concept come to life
- **Color scheme generation** - AI-designed brand colors
- **Screen-by-screen breakdown** - Dashboard, key features, user flows
- **Phone mockup visualization** - See how your app looks on mobile
- **Key features extraction** - Core functionality identified
- **Monetization UI concepts** - Pricing page designs

### 💳 FlowGlad Payment Integration
- **Seamless checkout** - One-click subscription setup
- **Multiple pricing tiers** - Free, Pro, and Enterprise plans
- **Subscription management** - Upgrade, downgrade, cancel anytime
- **Billing portal** - Full billing history and management

### 🔐 Authentication
- **Email/password login** - Simple, secure authentication
- **Session management** - Persistent login across sessions
- **Protected features** - Premium features gated behind subscription

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (Lovable Cloud) |
| **AI** | Google Gemini 2.5 Flash (via Lovable AI) |
| **Payments** | FlowGlad |
| **Database** | PostgreSQL (Supabase) |
| **Edge Functions** | Deno (Supabase Functions) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/FlowGlad-iator.git

# Navigate to project directory
cd FlowGlad-iator

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The following environment variables are required (automatically configured in Lovable):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

## 📁 Project Structure

```
FlowGlad-iator/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── AppPreview.tsx   # AI app preview generator
│   │   ├── AnalysisResults.tsx
│   │   ├── HeroSection.tsx
│   │   └── ...
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Page components
│   │   ├── Index.tsx        # Main landing page
│   │   ├── Auth.tsx         # Authentication
│   │   ├── Pricing.tsx      # Pricing plans
│   │   ├── Billing.tsx      # Subscription management
│   │   └── History.tsx      # Analysis history
│   └── integrations/        # External integrations
├── supabase/
│   ├── functions/           # Edge functions
│   │   ├── analyze-idea/    # AI idea analysis
│   │   ├── generate-app-preview/  # AI app preview
│   │   └── flowglad-billing/      # Payment processing
│   └── config.toml          # Supabase configuration
└── ...
```

---

## 🎯 How It Works

1. **Describe Your Idea** - Enter your startup concept in natural language
2. **AI Analysis** - Gemini 2.5 Flash analyzes viability, market, and potential
3. **App Preview** - AI generates a visual concept with screens and features
4. **Monetize** - Subscribe to unlock premium features and build your app

---

## 🏆 Hackathon Context

**FlowGlad Vibe Coding Hackathon**
- **Date**: December 14, 2025
- **Location**: FlowGlad offices, New York
- **Judging Criteria**:
  - 50% Creative Use of Vibe Coding
  - 50% Transaction Dollar Volume

FlowGladiator demonstrates:
- ✅ **Vibe Coding**: AI-generated UI/UX, dynamic app concepts, intelligent analysis
- ✅ **Real Payments**: Full FlowGlad integration with live checkout

---

## 📄 License

MIT License - feel free to use this project as inspiration for your own ideas!

---

## 🙏 Acknowledgments

- [Lovable](https://lovable.dev) - AI-powered app development platform
- [FlowGlad](https://flowglad.com) - Payments infrastructure
- [Supabase](https://supabase.com) - Backend as a service
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components

---

**Built with ❤️ using Lovable**
