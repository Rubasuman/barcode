# Running Backend & Frontend Concurrently

## Quick Start

### Option 1: Run Both Simultaneously (Recommended)

```bash
# Install all dependencies
npm run setup

# Start development mode (backend + frontend running together)
npm run dev
```

This will:
- Start the backend on `http://localhost:5000`
- Start the frontend on `http://localhost:5173` (or next available port)
- Both run in the same terminal with color-coded output

### Option 2: Manual Setup (If you prefer separate terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd f
npm install
npm run dev
# App runs on http://localhost:5173
```

## Available Scripts

From the root directory (`barcode-system/`):

| Command | What it does |
|---------|-------------|
| `npm run setup` | Installs all dependencies (one-time setup) |
| `npm run dev` | Runs backend + frontend concurrently in development mode |
| `npm run install-all` | Installs dependencies for root, backend, and frontend |
| `npm run backend:dev` | Runs only backend in dev mode |
| `npm run frontend:dev` | Runs only frontend in dev mode |
| `npm run backend:start` | Runs only backend in production mode |
| `npm run frontend:build` | Builds frontend for production |

## Environment Setup

### Backend (.env file)

Create `.env` in the `backend/` folder:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

### Frontend

Frontend is already configured to use `http://localhost:5000/api` for backend calls.

## Troubleshooting

### Port Already in Use
If port 5000 (backend) or 5173 (frontend) is already in use:

**For Backend:** Change `PORT` in `.env`
**For Frontend:** Vite will automatically use the next available port

### Dependencies Not Installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm run install-all
```

### Backend Connection Error in Frontend
Make sure:
1. Backend is running on `http://localhost:5000`
2. CORS is enabled in backend (already configured)
3. Check browser console for detailed error messages

## Project Structure

```
barcode-system/
├── package.json (root - with concurrent scripts)
├── backend/
│   ├── package.json (backend dependencies)
│   ├── server.js (Express server)
│   ├── .env (Supabase credentials)
│   └── ...
└── f/
    ├── package.json (frontend dependencies)
    ├── vite.config.js (Vite config)
    └── ...
```

## Next Steps

1. Run `npm run setup` from the root directory
2. Configure `.env` in the `backend/` folder with Supabase credentials
3. Run `npm run dev` to start both servers
4. Open `http://localhost:5173` in your browser
