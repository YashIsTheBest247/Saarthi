// Vercel Serverless Function — wraps the Express app so the whole /api/* surface
// (agents, router, emergency, telegram webhook, news) runs on Vercel alongside
// the static frontend. The vercel.json rewrite sends /api/(.*) here.
import app from "../server/app.js";

export default app;
