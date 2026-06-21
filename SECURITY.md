# NotFlix Security Architecture

This document outlines the security practices implemented in NotFlix to protect API keys, secrets, and sensitive logic.

## Security Layers

### 1. Frontend (Client-Side) - `src/`
- **Only exposes safe, public environment variables** (`VITE_*` prefix)
- **Never stores or uses secret keys** (TMDB API key, service_role keys)
- All external API calls go through the backend proxy

### 2. Backend (Server-Side) - `server/` or Supabase Edge Functions
- Stores all secret credentials in `.env` (never committed to git)
- Validates and sanitizes all incoming requests
- Implements rate limiting to prevent abuse
- Proxies TMDB API calls with the secret API key

### 3. Database (Supabase) - RPC Functions
- Uses Supabase RPC functions for write operations
- Row Level Security (RLS) enforced on all tables
- Users can only access their own data

## Environment Variables

### Frontend-safe (`.env`):
```bash
# Safe to expose to client (VITE_ prefix)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API endpoint (for development)
VITE_API_BASE=http://localhost:3001
```

### Server secrets (`.env`):
```bash
# NEVER commit this file!
TMDB_API_KEY=your-tmdb-secret-key
TMDB_BASE_URL=https://api.themoviedb.org/3
PORT=3001
FRONTEND_URL=http://localhost:5173
```

## Critical Security Rules

### API Keys (CRITICAL)
- ❌ **NEVER** store TMDB API key in frontend code
- ❌ **NEVER** commit `.env` files to version control
- ✅ Only use keys via server-side proxy

### Supabase Usage
- ✅ Frontend: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ❌ **NEVER** expose `service_role` key in frontend
- ✅ All write operations use RPC functions with user validation

### Authentication
- Tokens handled by Supabase Auth client
- Sessions cleared on logout via `supabase.auth.signOut()` and localStorage cleanup
- Proper session management in `src/services/db.js`

### Rate Limiting
- General API: 100 requests per 15 minutes per IP
- Reviews: 5 submissions per minute per IP

## Database RLS Policies

Ensure the following tables have RLS enabled with proper policies:

```sql
-- Profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles 
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = id);
CREATE POLICY "profiles_update" ON profiles 
    FOR UPDATE TO authenticated 
    USING ((select auth.uid()) = id) 
    WITH CHECK ((select auth.uid()) = id);

-- Watchlist table
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_select" ON watchlist 
    FOR SELECT TO authenticated 
    USING ((select auth.uid()) = user_id);
CREATE POLICY "watchlist_insert" ON watchlist 
    FOR INSERT TO authenticated 
    WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "watchlist_delete" ON watchlist 
    FOR DELETE TO authenticated 
    USING ((select auth.uid()) = user_id);

-- Continue watching table
ALTER TABLE continue_watching ENABLE ROW LEVEL SECURITY;
CREATE POLICY "continue_watching_user_only" ON continue_watching
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- Media comments/reviews table
ALTER TABLE media_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_read_all" ON media_comments
    FOR SELECT TO anon, authenticated
    USING (true);
CREATE POLICY "comments_insert_auth" ON media_comments
    FOR INSERT TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);
```

## Deployment Checklist

1. Set environment variables in production (frontend via Vite, server via hosting platform)
2. Deploy Edge Function or server with TMDB_API_KEY
3. Run `supabase db advisors` to verify RLS policies
4. Test that unauthenticated users cannot write to protected tables
5. Verify TMDB API key is not visible in browser dev tools