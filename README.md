# Cyber Aware - Login Test (React + Supabase) [CSS separated]

## 1) Install
```bash
npm install
```

## 2) Configure env
Copy `.env.example` to `.env` and set:
- `VITE_SUPABASE_URL`  (Supabase -> Project Settings -> API -> Project URL)
- `VITE_SUPABASE_ANON_KEY` (Supabase -> Project Settings -> API -> anon public key)

## 3) Create a test user
Supabase -> Authentication -> Users -> Add user -> Create new user
- Email: `test001@local.app`
- Password: (set your own)
- Check **Email confirmed**

## 4) Run
```bash
npm run dev
```

Open the URL shown in terminal (usually http://localhost:5173)

## Login
- Username: `test001`  (the app converts to `test001@local.app`)
- Password: your password
