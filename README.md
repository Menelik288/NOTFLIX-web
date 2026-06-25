# Notflix 🍿🎬

![Notflix Logo](public/favicon.png)

A modern, full-stack web application clone of Netflix, designed to provide a premium movie and TV show browsing experience. 

### 🌐 Live Demo
**[https://notflix-yu1n.onrender.com/]([https://notflix-yu1n.onrender.com/](https://www.notflix.pro.et/#/))**

---

## ✨ Features
* **Extensive Catalog:** Browse Trending, Top Rated, Now Playing, and Action/Comedy movies and TV shows.
* **Smart Search:** Dynamic search bar with autocomplete suggestions across all titles, genres, and cast members.
* **Authentication:** Secure user sign-up and login powered by Supabase Auth.
* **User Profiles:** Customize your public identity and profile avatar.
* **Watchlist:** Add your favorite shows and movies to your personalized Watchlist.
* **Continue Watching:** Automatically tracks your viewing progress for easy resumption.
* **Responsive Design:** A beautiful, fully responsive UI built with Tailwind CSS, featuring glassmorphism and modern micro-animations.
* **Localization:** Supports English and Amharic translations.

---

## 🛠️ Tech Stack
* **Frontend:** React 19, Vite, Tailwind CSS
* **Backend:** Express.js (Node.js) proxy server
* **Database & Auth:** Supabase (PostgreSQL)
* **Data Provider:** [TMDB (The Movie Database) API](https://www.themoviedb.org/)
* **Hosting:** Render (Web Service & Static Site)

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- Supabase Project & Credentials
- TMDB API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Menelik288/NOTFLIX-web.git
   cd NOTFLIX-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory for the frontend:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE=http://localhost:3001
   ```
   Create a `.env` file in the `server/` directory for the backend:
   ```env
   PORT=3001
   TMDB_API_KEY=your_tmdb_api_key
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ```

4. **Run the development servers:**
   ```bash
   npm run dev:all
   ```
   *This command uses concurrently to start both the Vite frontend and the Express backend simultaneously.*

---

## 📄 License
This project is for educational purposes only. Not affiliated with Netflix. Data provided by TMDB.
