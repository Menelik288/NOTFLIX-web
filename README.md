# Notflix 🍿🎬

![Notflix Logo](public/favicon.png)

A modern, full-stack web application clone of Netflix, designed to provide a premium movie and TV show browsing experience. 

### 🌐 Live Demo
**[https://www.notflix.pro.et/#/](https://www.notflix.pro.et/#/)**

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

📸 Web App Screenshots

🏠 Main Pages

<p align="center">
  <img src="https://github.com/user-attachments/assets/c68e1e7f-c407-4b57-8f83-4b9ab9c01402" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/e215f995-7cb5-4167-b740-3d63edcf184e" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/c9c9e572-1c6b-4255-8a26-5b6c3133c239" width="800"/>
</p>

⸻

🎬 Features & UI

<p align="center">
  <img src="https://github.com/user-attachments/assets/74e14a7a-5bad-4a03-abad-1a2b1636f7b7" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/71bbecb7-f627-4957-8697-651ba6ac9d72" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/8d0714c2-a1dc-4564-bf4d-e50fd9228c3b" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/cc4da9fa-6ffc-4c3c-9c20-ed15cefcaea9" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/6c81a052-245c-4d85-81af-cb3799417a08" width="800"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/c182641d-954d-497a-a3a5-6adb373b5de4" width="800"/>
</p>

⸻

⚙️ Settings & Extras

<p align="center">
  <img src="https://github.com/user-attachments/assets/a237d193-d115-42f9-af49-69103b5601f4" width="400"/>
  <img src="https://github.com/user-attachments/assets/e67082a6-2828-4a4d-9226-3b5ac58f1265" width="400"/>
</p>
<p align="center">
  <img src="https://github.com/user-attachments/assets/ba32dfe0-3923-4fb6-9d7d-da4129edc7b7" width="250"/>
  <img src="https://github.com/user-attachments/assets/6478486b-c725-40cb-9459-85638b062246" width="400"/>
  <img src="https://github.com/user-attachments/assets/b86473c7-e35b-4dcb-a54e-df08ca3d3193" width="400"/>
</p>

⸻

<p align="center">
  <img src="https://github.com/user-attachments/assets/b9ffe498-f296-4e8c-be15-1e4c91ffdd37" width="800"/>
</p>

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
