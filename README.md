# 🧠 ReviseAI

### AI-Powered Adaptive Learning & Revision Platform

> **Study smarter. Revise better. Improve continuously.**

ReviseAI is an AI-powered learning and revision platform designed to help students transform their study material into a personalized, interactive, and adaptive learning experience.

Students can upload their **syllabus, notes, previous-year questions, and other study resources**, while ReviseAI uses artificial intelligence to understand, organize, and transform that material into useful revision and practice content.

The platform combines **AI, adaptive learning, spaced repetition, analytics, and gamification** to help students understand what to study, what to revise, and where they need to improve.

---

## 📖 Table of Contents

- [About ReviseAI](#-about-reviseai)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [How ReviseAI Works](#-how-reviseai-works)
- [AI-Powered Learning](#-ai-powered-learning)
- [Adaptive Revision](#-adaptive-revision)
- [Spaced Repetition](#-spaced-repetition)
- [Analytics](#-analytics)
- [Gamification](#-gamification)
- [Authentication](#-authentication)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Application Structure](#-application-structure)
- [Database Architecture](#-database-architecture)
- [API Architecture](#-api-architecture)
- [Security](#-security)
- [UI/UX Design](#-uiux-design)
- [Development Workflow](#-development-workflow)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Project Status](#-project-status)
- [Future Roadmap](#-future-roadmap)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)

---

# 📌 About ReviseAI

Students often have access to a large amount of academic material, but the real challenge is knowing **how and when to use it effectively**.

A student may have:

- Lecture notes
- Syllabus documents
- Previous-year questions
- PDFs
- Books
- Class material
- Practice questions

But still struggle with:

> **"What should I study next?"**

ReviseAI is designed to answer that question.

Instead of providing students with another static collection of content, ReviseAI builds a personalized learning experience around the student's **own study material and performance**.

---

# ❗ Problem Statement

Traditional study applications often provide generic learning content.

However, every student has different:

- Subjects
- Syllabi
- Strengths
- Weaknesses
- Learning speed
- Revision habits
- Exam requirements

This creates several problems:

| Problem | Impact |
|---|---|
| Large amount of study material | Difficult to organize |
| Manual revision planning | Time-consuming |
| Generic practice questions | Less personalized |
| Forgetting previously learned concepts | Poor retention |
| Lack of performance insights | Difficult to identify weaknesses |
| Inconsistent study habits | Reduced progress |
| No clear revision priority | Time wasted on low-priority topics |

ReviseAI aims to address these problems through an **AI-assisted adaptive learning system**.

---

# 💡 Our Solution

ReviseAI connects the student's study material, learning activity, and performance into one system.

```text
                Student
                   │
                   ▼
          Study Material
                   │
                   ▼
              ReviseAI
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
     Organize              Understand
        │                     │
        └──────────┬──────────┘
                   ▼
          Personalized Learning
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    Practice     Revise     Analyze
       │           │           │
       └───────────┼───────────┘
                   ▼
          Personalized Guidance
```

## ✨ Key Features

### 📚 Subject Management

Students can organize their academic journey through subjects.

Features include:

- Create subjects manually
- Upload a syllabus to detect subjects
- View subjects
- Subject dashboard
- Subject workspace
- Subject progress
- Subject mastery
- Subject status
- Subject-specific learning information

### 📄 Syllabus Upload & Processing

Students can upload their syllabus instead of manually entering every subject.

ReviseAI processes the uploaded document and identifies relevant subjects.

```text
Upload Syllabus
      ↓
File Validation
      ↓
Text Extraction
      ↓
OCR Fallback
      ↓
AI Analysis
      ↓
Subject Detection
      ↓
Validation
      ↓
Deduplication
      ↓
Student Confirmation
      ↓
Subjects Created
```

The student remains in control of the final subjects added to their account.

### 🤖 AI-Powered Content Generation

ReviseAI uses AI to transform academic material into interactive learning resources.

Planned capabilities include:

- AI-generated flashcards
- Multiple-choice questions
- Short-answer questions
- Long-answer questions
- Conceptual questions
- Practice questions
- Explanations
- Subjective answer evaluation

The goal is to convert passive study material into active learning.

### 🃏 Flashcards

AI-generated flashcards can help students quickly review important concepts.

**Example:**

```text
┌─────────────────────────────┐
│ QUESTION                    │
│                             │
│ What is normalization in    │
│ database management?        │
└─────────────────────────────┘

              ↓

┌─────────────────────────────┐
│ ANSWER                      │
│                             │
│ Normalization is the process│
│ of organizing database data │
│ to reduce redundancy and    │
│ improve data integrity.     │
└─────────────────────────────┘
```

### ❓ Question Generation

ReviseAI can generate questions based on the student's learning material.

Supported/planned question types include:

- MCQs
- Short answers
- Long answers
- Conceptual questions
- Practice questions

Questions can be used as part of personalized revision sessions.

### 🔄 Adaptive Revision

ReviseAI is designed to make revision dynamic rather than treating every topic equally.

The system can consider:

- Previous performance
- Correct answers
- Incorrect answers
- Revision history
- Topic mastery
- Time since last revision
- Study consistency

**Example:**

```text
Strong Performance
        ↓
Higher Mastery
        ↓
Lower Revision Priority

Weak Performance
        ↓
Lower Mastery
        ↓
Higher Revision Priority
```

This allows students to spend more time on areas where they actually need improvement.

### 🧠 Spaced Repetition

ReviseAI incorporates spaced-repetition principles to support long-term retention.

```text
Learn
  ↓
Review
  ↓
Evaluate Performance
  ↓
Schedule Next Review
  ↓
Review
  ↓
Update Performance
  ↓
Schedule Next Review
```

The revision schedule can adapt based on how well the student performs.

### 📊 Analytics

ReviseAI provides insights into the student's learning journey.

Analytics can include:

- Subject progress
- Topic mastery
- Accuracy
- Questions attempted
- Correct answers
- Study time
- Revision consistency
- Weak areas
- Performance trends
- Exam readiness

**Example:**

```text
DBMS

Mastery             ████████████████░░░░ 80%
Accuracy            █████████████████░░░ 85%

Questions Attempted
120

Correct Answers
102

Study Time
8h 42m
```

The objective is to turn raw learning activity into actionable information.

### 🎮 Gamification

ReviseAI uses gamification to encourage consistent learning.

Gamification elements include:

- XP
- Levels
- Streaks
- Achievements
- Milestones
- Progress indicators
- Motivational feedback

**Example:**

```text
Correct Answer     → +10 XP
Difficult Question → +20 XP
Revision Milestone → +50 XP
Daily Goal         → XP Reward
```

Gamification is designed to support learning consistency rather than distract from learning.

### 🔐 Authentication

ReviseAI provides secure account management.

Features include:

- User registration
- Email verification
- **OTP** verification
- Login
- Google Sign-In
- Forgot password
- Password reset
- **JWT** authentication
- Protected routes
- Session management
- Authorization

#### Authentication Flow

```text
Register
   ↓
OTP Verification
   ↓
Account Verified
   ↓
Login
   ↓
JWT Session
   ↓
Protected Application
```

## 🏗️ System Architecture

ReviseAI follows a modular full-stack architecture.

```text
┌──────────────────────────────────────┐
│              FRONTEND                │
│                                      │
│ React + Vite                         │
│                                      │
│ Pages • Components • Layouts • UI    │
└───────────────────┬──────────────────┘
                    │
                    │ REST API
                    ▼
┌──────────────────────────────────────┐
│              BACKEND                 │
│                                      │
│ Node.js + Express                    │
│                                      │
│ Routes                               │
│ Controllers                          │
│ Services                             │
│ Middleware                           │
│ Validation                           │
│ Authentication                       │
└───────────────────┬──────────────────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
┌──────────────────┐ ┌──────────────────┐
│     MongoDB      │ │   AI Services    │
│                  │ │                  │
│ Users            │ │ Document         │
│ Subjects         │ │ Understanding    │
│ Progress         │ │ Generation       │
│ Revision Data    │ │ Evaluation       │
│ Learning Data    │ │ Analysis         │
└──────────────────┘ └──────────────────┘
```

## 🛠️ Technology Stack

### Frontend

- **React.js** — Component-based UI
- **Vite** — Frontend tooling and development server
- **Tailwind CSS** — Utility-first styling
- **DaisyUI** — UI components
- **Lucide React** — Icon library

### Backend

- **Node.js**
- **Express.js**
- **REST APIs**
- **JWT Authentication**

### Database

- **MongoDB**
- **Mongoose**

### AI

AI services are used for:

- Document understanding
- Subject extraction
- Content generation
- Question generation
- Answer evaluation
- Personalized learning

### Development Tools

- Git
- GitHub
- Postman
- Visual Studio Code

### Deployment

- Vercel
- Cloud-hosted database
- External AI and notification services where required

## 📁 Application Structure

```text
ReviseAI/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── ...
│   └── ...
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   └── ...
│
├── docs/
│   ├── phase/
│   ├── SRS.md
│   └── ...
│
├── AI_RULES.md
├── README.md
└── ...
```

The structure may evolve as the application grows.

## 🗄️ Database Architecture

MongoDB is used as the primary database.

The application follows a modular domain-oriented data structure.

### Core Entities

```text
User
│
├── UserProgress
│
├── Subjects
│   │
│   ├── Units
│   └── Topics
│       └── Learning Data
│
└── Revision / Performance Data
```

### UserProgress

`UserProgress` acts as an aggregate/projection of important learning metrics.

It can contain information such as:

- User ID
- Subject count
- XP
- Level
- Current streak
- Longest streak
- Questions answered
- Correct answers
- Study time
- Daily revision goal
- Daily revision completion
- Last activity
- Last revision

The backend remains responsible for maintaining these values.

## 🔌 API Architecture

ReviseAI follows a **REST-based API** architecture.

### General Request Flow

```text
Frontend
   ↓
Route
   ↓
Authentication Middleware
   ↓
Controller
   ↓
Service
   ↓
Database / AI Service
   ↓
Response
   ↓
Frontend
```

### Standard Success Response

```json
{
  "success": true,
  "message": "Subject created successfully",
  "subject": {}
}
```

### Standard Error Response

```json
{
  "success": false,
  "message": "Subject already exists"
}
```

This standardized response structure keeps frontend/backend communication predictable.

## 🔒 Security

Security is treated as a core part of ReviseAI.

The application follows practices such as:

- Password hashing
- **JWT** validation
- Protected routes
- Authorization checks
- Request validation
- Input sanitization
- **OTP** expiration
- Rate limiting
- Secure database access
- Secure file handling
- Environment variable protection
- AI prompt-injection protection

### Sensitive Information

The following must never be committed to GitHub:

- `.env`
- `.env.local`
- Database credentials
- API keys
- JWT secrets
- OAuth secrets
- SMTP credentials

## 🎨 UI/UX Design

ReviseAI follows a playful, modern, and student-focused interface.

The design aims to be:

- Clean
- Interactive
- Friendly
- Motivational
- Modern
- Responsive
- Easy to understand

### Design Language

The interface uses a consistent visual system with:

- Primary indigo
- Supporting purple
- Cyan informational elements
- Pink playful elements
- Yellow XP/reward elements
- Red/orange warning and weak-area indicators

### Navigation

The main application navigation includes:

- Home
- Subjects
- Revision
- Analytics

Additional actions include:

- Quick Revision
- XP
- Settings
- Support
- Profile

The navigation remains consistent throughout the application, with the current section clearly highlighted.

## 🔄 Complete User Journey

A typical ReviseAI learning journey can look like:

```text
Register
   ↓
OTP Verification
   ↓
Login
   ↓
Home
   ↓
┌────────────────────────────┐
│ Create Subject OR          │
│ Upload Syllabus            │
└──────────────┬─────────────┘
               ↓
          AI Analysis
               ↓
       Detected Subjects
               ↓
          Confirmation
               ↓
      Subjects Dashboard
               ↓
        Subject Workspace
               ↓
          Units / Topics
               ↓
       Learning Materials
               ↓
     AI Questions / Flashcards
               ↓
            Practice
               ↓
       Adaptive Revision
               ↓
           Analytics
               ↓
        Recommendations
               ↓
          Improvement
```

## 🔁 Revision Feedback Loop

ReviseAI is designed around a continuous learning feedback loop.

```text
Student Studies
      ↓
Practice
      ↓
Performance Data
      ↓
AI / Analytics
      ↓
Identify Weak Areas
      ↓
Prioritize Revision
      ↓
Student Revises
      ↓
New Performance Data
      ↓
Updated Plan
      ↓
Continue Learning
```

This allows the system to become increasingly personalized as the student uses it.

## 🌳 Development Workflow

ReviseAI follows a structured Git-based development workflow.

```text
main
  │
  ├── Development Documentation
  │
  ▼
Feature Branch
  │
  ▼
Implementation
  │
  ▼
Testing
  │
  ▼
Review
  │
  ▼
Merge
  │
  ▼
main
```

### Development Principles

- Keep changes focused.
- Do not break existing functionality.
- Avoid modifying unrelated features.
- Reuse existing components and utilities.
- Follow established architecture.
- Test before merging.
- Keep documentation updated.
- Never commit secrets.
- Review changes before integration.

## ⚙️ Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git
- MongoDB access
- Required API credentials

### Clone the Repository

```bash
git clone <repository-url>
cd ReviseAI
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

### Configure Environment Variables

Create the required environment files according to the project's configuration.

Example:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AI_API_KEY=your_ai_api_key
```

Additional variables may be required for email, storage, AI, notifications, and other services.

> **Never commit real credentials or `.env` files to the repository.**

### Start the Backend

```bash
cd server
npm run dev
```

### Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend and backend can then communicate through the configured API environment.

## 🧪 Testing

ReviseAI uses multiple levels of testing to maintain reliability.

### Frontend Testing

- UI interaction testing
- Navigation testing
- Responsive testing
- Loading-state testing
- Error-state testing
- Empty-state testing
- Form validation

### Backend Testing

- API testing
- Authentication testing
- Authorization testing
- Validation testing
- Database testing
- Error handling
- File upload testing

### Integration Testing

Important user journeys are tested across the complete stack.

```text
Frontend
   ↓
API Request
   ↓
Backend
   ↓
Database / AI
   ↓
API Response
   ↓
Frontend
```

## 🚧 Project Status

ReviseAI is currently under active development.

The application is being developed incrementally, with core functionality being integrated progressively.

Some capabilities described in the documentation are planned features and may not yet be available in the current build.

## 🗺️ Future Roadmap

The long-term ReviseAI roadmap includes:

### 📚 Learning Management

- Advanced subject organization
- Units
- Topics
- Study materials
- Notes
- Previous-year questions

### 🤖 AI Learning

- Advanced content generation
- Context-aware question generation
- Flashcard generation
- AI explanations
- Personalized learning assistance

### 🔄 Adaptive Revision

- Advanced revision scheduling
- Spaced repetition algorithms
- Performance-based scheduling
- Weak-topic prioritization

### 📝 AI Evaluation

- Subjective answer evaluation
- AI-generated feedback
- Answer quality analysis
- Improvement suggestions

### 📊 Advanced Analytics

- Learning trends
- Topic-level mastery
- Subject performance
- Exam readiness
- Weak-area detection

### 🧠 Recommendations

- Personalized study recommendations
- Smart focus areas
- Next-best-action suggestions
- Adaptive study planning

### 🎮 Gamification

- XP progression
- Levels
- Achievements
- Streaks
- Learning milestones
- Leaderboards where appropriate

### 🔔 Notifications

- Revision reminders
- Study reminders
- Streak reminders
- Achievement notifications
- Personalized notifications

## 👥 Team

### Byte Buddies

| Member | Role |
|---|---|
| Bikram Singh Bisht | Team Lead |
| Anshul Gusain | Frontend / UI |
| Anukool | Frontend / UX Integration |
| Amit | Backend / Core Services |

The team follows collaborative development practices using Git and GitHub.

## 🤝 Contributing

Contributions should follow the project's development standards.

Before making changes:

1. Understand the existing architecture.
2. Check whether the functionality already exists.
3. Reuse existing components and utilities.
4. Avoid unrelated modifications.
5. Follow the project's coding conventions.
6. Test your changes.
7. Update relevant documentation.
8. Submit the changes for review.

## 📄 License

This project is currently being developed as an academic/team project.

License details will be added once the project's licensing decision has been finalized.

## 🧠 Core Philosophy

ReviseAI follows one simple principle:

> **Every feature should help the student take the next best action toward better learning.**

The platform is not designed simply to provide more content.

It is designed to help students understand:

```text
What should I study?
        ↓
What should I practice?
        ↓
What am I weak at?
        ↓
What should I revise?
        ↓
When should I revise it?
        ↓
Am I improving?
```

---

# 🧠 ReviseAI

**Study Smarter • Revise Better • Improve Continuously**

Built with ❤️ by **Byte Buddies**
