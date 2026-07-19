# Spandana Care Aid Foundation — Production MERN Stack

All 22 issues fixed. admin.tsx (6029 lines) split into 30 individual tab files.

## Structure
- `backend/` — Express 5 MVC (config / middleware / models / controllers / routes / services)
- `frontend/src/pages/admin/index.tsx` — Admin shell (routing only)
- `frontend/src/pages/admin/types.ts`  — All shared TypeScript interfaces
- `frontend/src/pages/admin/shared.tsx` — Label, Field, SectionCard, DeviceTabs, VisibilityToggleRow
- `frontend/src/pages/admin/tabs/` — 30 files, one per admin tab
- `frontend/src/services/` — 17 API service files (zero raw fetch in components)

## Quick Start
```bash
npm run install:all
cp backend/.env.example backend/.env  # edit ADMIN_PASSWORD + SESSION_SECRET
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000/api/v1/docs
```

