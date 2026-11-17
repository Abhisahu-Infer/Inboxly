# Inboxly – AI Email Management Dashboard (MERN prototype)

MongoDB + Express + React (Vite) + Node. Gmail/Outlook connection and email data are simulated
(sample mailboxes in `server/seed.js`); auth, API, database and AI triage are real.

## Setup
1. Install Node.js 18+ and MongoDB (local) or create a free MongoDB Atlas cluster.
2. `server/.env` already exists. Edit `MONGO_URI` if you use Atlas.
3. In the project folder (VS Code terminal):

       npm run install-all
       npm run dev

4. Open http://localhost:5173 . API runs on http://localhost:5000 .

## Structure
- `server/models.js`  User, Account, Client, Email schemas (Email has owner, priority, confidence, reason)
- `server/ai.js`      classify(): decides who should reply; draft(): suggested reply
- `server/routes/`    auth (signup/login with JWT, bcrypt) and api (accounts, emails, stats)
- `client/src/`       App flow, Auth, Connect (consent + sync), Dashboard (Assistant + Client views)

## API
POST /api/auth/signup, /login · GET /api/accounts · POST /api/accounts {provider} · POST /api/accounts/:id/sync
GET /api/clients · GET /api/emails?client&filter&q · GET /api/stats · PATCH /api/emails/:id · POST /api/emails/simulate

## Next steps
Real Gmail/Microsoft OAuth, an LLM call inside `classify()`, background sync, deployment
(Atlas + Render for server, Vercel for client).

## Deploy
1. MongoDB Atlas: create a free cluster, a database user, allow 0.0.0.0/0, copy the connection string.
2. Push the project to GitHub.
3. Render (Web Service): root directory `server`, build `npm install`, start `npm start`.
   Env vars: `MONGO_URI`, `JWT_SECRET`. Copy the Render URL.
4. Vercel: import the repo, root directory `client`, framework Vite.
   Env var: `VITE_API_URL` = your Render URL (no trailing slash). Deploy.
