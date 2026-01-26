# HablaFácil AAC - Spanish Augmentative Communication App

A web-based **Augmentative and Alternative Communication (AAC)** application for Spanish-speaking users. Built with modern web technologies following **Clean Architecture** principles.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2 | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 7.2 | Build Tool & Dev Server |
| TailwindCSS | 4.1 | Styling |
| Supabase | 2.91 | Cloud Database (Optional) |
| Web Speech API | Native | Text-to-Speech |

---

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

> **Note:** Supabase is **optional**. The app includes bundled vocabulary data and works fully offline!

---

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd FinalProyect
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

**That's it!** The app works immediately with local vocabulary data (100+ Spanish words).

---

## ☁️ Optional: Supabase Cloud Database

If you want cloud sync capabilities, configure Supabase:

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Add Your Credentials

Edit `.env`:

```env
# Get these from: Supabase Dashboard -> Project Settings -> API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - For premium TTS quality
VITE_GOOGLE_CLOUD_TTS_API_KEY=your_google_cloud_api_key
```

### 3. Set Up Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Paste contents of `supabase_setup.sql` and run

> **Fallback Behavior:** If Supabase is not configured or unavailable, the app automatically uses local data from `src/data/vocabulary.json` and `src/data/locations.json`.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

---

## 🏗️ Project Architecture

This project follows **Clean Architecture** principles:

```
src/
├── domain/           # Business logic & entities
│   ├── entities/     # Word, Location types
│   ├── services/     # Core business services
│   └── constants/    # Domain constants
│
├── infrastructure/   # External services & data
│   ├── supabase/     # Supabase client & repositories
│   └── speech/       # Text-to-Speech providers
│
├── presentation/     # UI layer
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── context/      # React context providers
│   └── pages/        # Page components
│
├── data/             # Local fallback data
│   ├── vocabulary.json   # 100+ Spanish words
│   └── locations.json    # Location contexts
│
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

---

## 🎙️ Text-to-Speech

The app uses browser-native **Web Speech API**:
- Automatically selects Latin American Spanish voices
- Falls back to any available Spanish voice
- Optional: Set `VITE_GOOGLE_CLOUD_TTS_API_KEY` for premium voices

---

## 🧪 Troubleshooting

### No Spanish Voices for TTS
- Try Edge (best Spanish voice support)
- Install Spanish language pack on your OS
- Check browser console for voice logs

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Additional Documentation

- [CLEAN_CODE_GUIDELINES.md](./CLEAN_CODE_GUIDELINES.md) - Coding standards
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Feature details
- [supabase_setup.sql](./supabase_setup.sql) - Database schema

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Ensure `npm run lint` and `npm run build` pass
3. Submit a pull request

---

Made with ❤️ for accessible communication
