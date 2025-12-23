# Christmas Quiz Multiplayer Application - Implementation Plan

## Overview
A real-time multiplayer quiz application with React frontend and Supabase backend, featuring a festive Christmas theme.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Christmas theme)
- **Backend**: Supabase (PostgreSQL + Realtime subscriptions)
- **Routing**: React Router v6
- **State Management**: React Context + Supabase Realtime

---

## Database Schema (Supabase)

### Tables

```sql
-- Quizzes table
quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  game_code TEXT UNIQUE NOT NULL,  -- 6-char code for joining
  status TEXT DEFAULT 'waiting',    -- waiting, active, finished
  current_question_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Questions table
questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,      -- 'multiple_choice' or 'text'
  options JSONB,                    -- ["A", "B", "C", "D"] for MC
  correct_answer TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)

-- Players table
players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW()
)

-- Answers table
answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, question_id)
)
```

---

## Application Flow

### Screen 1: Join Game (`/`)
- Single input field for 6-character game code
- Player name input
- "Join Quiz" button
- Christmas-themed background with snowflakes

### Screen 2: Lobby (`/game/:gameCode/lobby`)
- Display list of all joined players (real-time updates via Supabase)
- "Start the Quiz" button (visible to all, any can start)
- Show quiz title
- Snowfall animation

### Screen 3: Quiz Questions (`/game/:gameCode/play`)
- Display current question
- Multiple choice: Radio buttons for options
- Text input: Free text field
- "Submit Answer" button
- Progress indicator (Question X of Y)
- No timer (per requirements)

### Screen 4: Summary (`/game/:gameCode/results`)
- Leaderboard showing all players ranked by correct answers
- Each player's score breakdown
- "Play Again" or "Join New Quiz" buttons
- Christmas celebration animation

### Admin Page (`/admin`)
- Protected by basic auth (username/password prompt)
- Create new quiz with title
- Add questions (multiple choice or text)
- Generate unique game code
- View/manage existing quizzes
- Delete quizzes

---

## Project Structure

```
quiz/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Snowfall.tsx       # Christmas animation
│   │   ├── JoinGame.tsx           # Screen 1
│   │   ├── Lobby.tsx              # Screen 2
│   │   ├── QuizQuestion.tsx       # Screen 3
│   │   ├── Results.tsx            # Screen 4
│   │   └── admin/
│   │       ├── AdminLogin.tsx
│   │       ├── AdminDashboard.tsx
│   │       ├── QuizEditor.tsx
│   │       └── QuestionForm.tsx
│   ├── contexts/
│   │   ├── GameContext.tsx        # Game state management
│   │   └── AuthContext.tsx        # Admin auth state
│   ├── hooks/
│   │   ├── useSupabase.ts
│   │   ├── useGameSubscription.ts # Real-time player/game updates
│   │   └── useQuiz.ts
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   └── utils.ts               # Helper functions
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── App.tsx                    # Router setup
│   ├── main.tsx
│   └── index.css                  # Tailwind + Christmas theme
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Vite + React + TypeScript project
2. Install dependencies (tailwindcss, @supabase/supabase-js, react-router-dom)
3. Configure Tailwind with Christmas color palette
4. Set up Supabase client
5. Create environment variables template

### Phase 2: Database Setup
1. Create SQL migration file with all tables
2. Set up Row Level Security (RLS) policies
3. Enable Realtime for players and quizzes tables
4. Create database types for TypeScript

### Phase 3: Core Components
1. Build reusable UI components (Button, Input, Card)
2. Create Snowfall animation component
3. Set up React Router with all routes
4. Create GameContext for state management

### Phase 4: Player Flow
1. Implement JoinGame screen
2. Implement Lobby with real-time player list
3. Implement QuizQuestion screen with both question types
4. Implement Results/Summary screen

### Phase 5: Admin Panel
1. Create basic auth protection component
2. Build AdminDashboard for quiz list
3. Build QuizEditor for creating/editing quizzes
4. Build QuestionForm for adding questions

### Phase 6: Real-time Features
1. Set up Supabase Realtime subscriptions
2. Sync player joins in lobby
3. Sync game state changes (start, next question)
4. Handle answer submissions

### Phase 7: Styling & Polish
1. Apply Christmas theme throughout
2. Add snowfall animation
3. Add festive colors and decorations
4. Responsive design for mobile

---

## Christmas Theme Colors

```css
--christmas-red: #c41e3a
--christmas-green: #1e5631
--christmas-gold: #ffd700
--snow-white: #fffafa
--pine-green: #01796f
```

---

## Key Features Summary

| Feature | Description |
|---------|-------------|
| Question Types | Multiple choice AND free text |
| Timer | No timer (players answer at own pace) |
| Quiz Start | Any player can start |
| Results | Shown only at the end |
| Admin Auth | Basic auth (username/password) |
| Real-time | Supabase Realtime for player sync |
| Theme | Christmas (snowfall, red/green colors) |
