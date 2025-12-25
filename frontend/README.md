# PhysioAI - AI-Powered Physical Therapy Platform

**Your Personal Therapy Assistant** - Get personalized exercise recommendations and real-time motion tracking for effective rehabilitation at home.

## 🌟 Project Overview

PhysioAI is a modern web application that combines AI-powered assessment, computer vision motion tracking, and gamification to provide an engaging physical therapy experience. Built for a hackathon to demonstrate the concept of accessible, AI-driven healthcare.

## ✨ Key Features

### For All Users (Free)
- 📚 **Exercise Library**: Browse 100+ professional exercises across 15+ body regions
- 📊 **Progress Dashboard**: Track your workout history, streaks, and achievements
- 🎯 **Body Part Selection**: Interactive anatomical map for targeted exercise selection
- 📹 **YouTube Integration**: Video demonstrations for every exercise

### Premium Features (Pro)
- 🤖 **AI Assessment**: Conversational chatbot analyzes your condition using Google Gemini AI
- 🎥 **Motion Tracking**: Real-time pose detection using MediaPipe for form correction
- 🗣️ **Voice Coach**: Motivational audio feedback during exercises
- 📈 **Advanced Analytics**: Pain progression tracking and detailed insights
- 🏆 **Gamification**: 10 achievement badges and streak tracking
- 📄 **PDF Reports**: Export your progress and health reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Google Gemini API key for AI recommendations

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd body-care-companion

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run at `http://localhost:8080`

## 🔐 Authentication

This is a **mock authentication system** for hackathon demonstration:
- Click "Log In" and enter any name/email
- New users automatically get a 15-day Pro trial
- All data stored in browser's LocalStorage

**Note**: No real authentication, payments, or backend integration.

## 💰 Pricing Structure

### Free Tier
- Access to all exercises
- Manual progress tracking
- Basic dashboard

### Pro Tier ($12.99/mo - Mock)
- AI-powered assessment
- Real-time motion tracking
- Voice coaching
- Advanced analytics
- Pain tracking
- PDF report export

## 🛠️ Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router

**AI & Computer Vision**
- Google Gemini AI (exercise recommendations)
- MediaPipe Pose (motion tracking)
- Web Speech API (voice coaching)

**Data & Charts**
- LocalStorage (persistence)
- Recharts (analytics)
- jsPDF (report generation)

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/          # shadcn/ui components
│   └── dashboard/   # Dashboard-specific components
├── pages/           # Main application pages
├── contexts/        # React Context (Auth)
├── data/            # Exercise database
├── utils/           # Helper functions & configs
├── services/        # API integrations (Gemini)
└── hooks/           # Custom React hooks
```

## 🎯 Usage Flow

1. **Landing Page**: Choose to browse exercises or start assessment
2. **Browse Exercises**: View all 100+ exercises (no login required)
3. **Body Selection**: Click areas on anatomical diagram
4. **AI Assessment** (Premium): Answer questions for personalized recommendations
5. **Exercise Execution**: 
   - Free users: Watch YouTube videos and track manually
   - Pro users: Real-time motion tracking with AI feedback
6. **Dashboard**: View progress, badges, and pain tracking

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

**Without API key**: The app uses rule-based fallback for recommendations.
