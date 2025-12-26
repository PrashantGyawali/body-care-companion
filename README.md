# PhysioAI 🏥💪

<div align="center">

![PhysioAI Banner](https://img.shields.io/badge/PhysioAI-AI%20Powered%20Therapy-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xOS41IDE0LjI1di0yLjYyNWEzLjM3NSAzLjM3NSAwIDAgMC0zLjM3NS0zLjM3NWgtLjI1TTUuMjUgOC4yNXYtMi42MjVhMy4zNzUgMy4zNzUgMCAwIDEgMy4zNzUtMy4zNzVoLjI1TTE5LjUgMTYuNWgyLjI1YTEuMTI1IDEuMTI1IDAgMCAxIDAgMi4yNWgtMi4yNWExLjEyNSAxLjEyNSAwIDAgMSAwLTIuMjV6Ii8+PC9zdmc+)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Your Personal AI-Powered Physical Therapy Assistant**

*Get personalized exercise recommendations and real-time motion tracking for effective rehabilitation at home.*

[Live Demo](#demo) • [Features](#-features) • [Installation](#-installation) • [Deployment](#-deployment) • [API Docs](#-api-documentation)

</div>

---

## 📖 Overview

PhysioAI is a comprehensive web application that revolutionizes physical therapy by combining **AI-powered assessment**, **real-time computer vision motion tracking**, and **gamification** to deliver an engaging and effective rehabilitation experience. Built to democratize access to quality physical therapy guidance.

### 🎯 Problem Statement
- Physical therapy is expensive and often inaccessible
- Patients struggle with exercise form without professional guidance
- Lack of motivation and progress tracking leads to poor adherence

### 💡 Our Solution
- AI-powered personalized exercise recommendations
- Real-time pose detection for form correction
- Gamified experience with achievements and streaks
- Comprehensive progress tracking and analytics

---

## ✨ Features

### 🆓 Free Tier
| Feature | Description |
|---------|-------------|
| 📚 **Exercise Library** | Browse 100+ professional exercises across 15+ body regions |
| 🎯 **Body Map Selection** | Interactive anatomical map for targeted exercise selection |
| 📹 **Video Demonstrations** | YouTube integration for every exercise |
| 📊 **Basic Progress Tracking** | Track your workout history and sessions |

### 💎 Pro Tier
| Feature | Description |
|---------|-------------|
| 🤖 **AI Assessment** | Conversational chatbot powered by Google Gemini AI analyzes your condition |
| 🎥 **Motion Tracking** | Real-time pose detection using MediaPipe for form correction |
| 🗣️ **Voice Coach** | Motivational audio feedback during exercises |
| 📈 **Advanced Analytics** | Pain progression tracking and detailed insights |
| 🏆 **Gamification** | 10+ achievement badges and streak tracking |
| 📄 **PDF Reports** | Export your progress and health reports |
| 🎨 **Pain Tracking** | Before/after pain level tracking for each session |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PhysioAI                                │
├──────────────────────────┬──────────────────────────────────────┤
│        Frontend          │              Backend                 │
│    (React + Vite)        │         (Express + Node)             │
├──────────────────────────┼──────────────────────────────────────┤
│  • React 18              │  • Express 5                         │
│  • TypeScript            │  • TypeScript                        │
│  • Tailwind CSS          │  • MongoDB + Mongoose                │
│  • Shadcn/ui             │  • JWT Authentication                │
│  • MediaPipe             │  • Google Gemini AI                  │
│  • Recharts              │  • bcrypt.js                         │
└──────────────────────────┴──────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │    External Services      │
                    ├───────────────────────────┤
                    │  • MongoDB Atlas          │
                    │  • Google Gemini API      │
                    │  • YouTube API            │
                    └───────────────────────────┘
```

---

## 📁 Project Structure

```
PhysioAI/
├── 📂 backend/                    # Express.js Backend
│   ├── 📂 src/
│   │   ├── 📂 config/             # Environment configuration
│   │   │   └── ENV.ts
│   │   ├── 📂 controllers/        # Route handlers
│   │   │   ├── aiController.ts    # AI recommendation logic
│   │   │   └── authController.ts  # Authentication logic
│   │   ├── 📂 lib/
│   │   │   └── mongodb.ts         # Database connection
│   │   ├── 📂 middleware/
│   │   │   └── authMiddleware.ts  # JWT verification
│   │   ├── 📂 models/
│   │   │   └── User.ts            # User schema
│   │   ├── 📂 routes/
│   │   │   ├── aiRoutes.ts        # AI endpoints
│   │   │   └── authRoutes.ts      # Auth endpoints
│   │   └── index.ts               # App entry point
│   ├── package.json
│   └── tsconfig.json
│
├── 📂 frontend/                   # React Frontend
│   ├── 📂 public/
│   │   ├── imagemapster.js
│   │   └── jquery.min.js
│   ├── 📂 src/
│   │   ├── 📂 components/         # React components
│   │   │   ├── 📂 dashboard/      # Dashboard components
│   │   │   ├── 📂 ui/             # Shadcn UI components
│   │   │   ├── BodyMap.tsx        # Interactive body selector
│   │   │   ├── ChatBot.tsx        # AI assessment chatbot
│   │   │   ├── ExerciseCard.tsx   # Exercise display card
│   │   │   ├── MotionDetector.tsx # Pose detection
│   │   │   └── UniversalExerciseCounter.tsx
│   │   ├── 📂 context/
│   │   │   └── AuthContext.tsx    # Authentication context
│   │   ├── 📂 data/
│   │   │   └── exercises.ts       # Exercise database
│   │   ├── 📂 hooks/              # Custom React hooks
│   │   ├── 📂 lib/
│   │   │   ├── axios.ts           # API client
│   │   │   └── utils.ts
│   │   ├── 📂 pages/              # Route pages
│   │   │   ├── AllExercises.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Index.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Register.tsx
│   │   ├── 📂 services/
│   │   │   └── gemini.ts          # AI service
│   │   ├── 📂 utils/
│   │   │   ├── exercise-configs.ts
│   │   │   ├── progressStore.ts   # Local storage management
│   │   │   ├── reportGenerator.ts # PDF report generation
│   │   │   └── voiceCoach.ts      # Voice feedback
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md                      # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or Atlas)
- **Google Gemini API Key** (for AI recommendations)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/PhysioAI.git
cd PhysioAI
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/physioai

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Google AI
GEMINI_API_KEY=your-gemini-api-key
```

Start the backend:

```bash
# Development mode
npx tsx src/index.ts

# Or with watch mode
npx tsx watch src/index.ts
```

Backend runs on `http://localhost:3000`

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend (from root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:8080`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Optional (defaults to `/api`) |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f...",
    "name": "John Doe",
    "email": "john@example.com",
    "subscriptionTier": "free"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### AI Endpoints

#### Get Exercise Recommendations
```http
POST /api/ai/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "assessmentData": {
    "bodyPart": "Lower Back",
    "painSeverity": "4-6 (Moderate)",
    "duration": "1-4 weeks",
    "painType": "Dull/Aching",
    "age": "30-45",
    "activityLevel": "Moderate activity"
  },
  "availableExercises": [...]
}
```

**Response:**
```json
{
  "recommendedIds": ["exercise-id-1", "exercise-id-2", "exercise-id-3"]
}
```

---

## 🌐 Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

#### Deploy Frontend to Vercel

1. **Connect Repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   cd frontend
   vercel
   ```

2. **Configure Build Settings:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `frontend`

3. **Environment Variables:**
   Add `VITE_API_URL` pointing to your backend URL

#### Deploy Backend to Railway

1. **Create Railway Project:**
   - Connect your GitHub repository
   - Set root directory to `backend`

2. **Configure Environment:**
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secret
   GEMINI_API_KEY=your-key
   PORT=3000
   ```

3. **Build Settings:**
   - Build Command: `npm install && npx tsc`
   - Start Command: `node dist/index.js`

### Option 2: Docker Deployment

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx tsc

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

**Run with Docker Compose:**
```bash
docker-compose up -d
```

### Option 3: Cloud Platform Deployments

#### AWS (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init physioai-backend --platform node.js

# Create environment
eb create production

# Deploy
eb deploy
```

#### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/physioai-backend ./backend

# Deploy
gcloud run deploy physioai-backend \
  --image gcr.io/PROJECT_ID/physioai-backend \
  --platform managed \
  --allow-unauthenticated
```

#### Azure App Service

```bash
# Create App Service
az webapp create --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name physioai-backend \
  --runtime "NODE:18-lts"

# Deploy
az webapp deployment source config \
  --name physioai-backend \
  --resource-group myResourceGroup \
  --repo-url https://github.com/yourusername/PhysioAI \
  --branch main
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS** | Styling |
| **Shadcn/ui** | Component Library |
| **MediaPipe** | Pose Detection |
| **Recharts** | Data Visualization |
| **React Router** | Routing |
| **Axios** | HTTP Client |
| **jsPDF** | PDF Generation |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express 5** | Web Framework |
| **TypeScript** | Type Safety |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **bcrypt.js** | Password Hashing |
| **Google Generative AI** | AI Recommendations |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/yourusername">
        <img src="https://avatars.githubusercontent.com/u/12345678?v=4" width="100px;" alt=""/><br />
        <sub><b>Your Name</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) for pose detection
- [Google Gemini](https://ai.google.dev/) for AI recommendations
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ for accessible healthcare

</div>
