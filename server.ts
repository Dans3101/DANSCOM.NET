import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Lazy initialization
let ai: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!ai) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set.");
      // Return a dummy client or null, and handle nulls later.
      // For now, let's keep it simple: throw a helpful error when used.
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  console.log("Starting server...");
  const app = express();
  app.use(express.json());
  const PORT = Number(process.env.PORT) || 3000;
  
  console.log("Environment:", process.env.NODE_ENV);

  // API routes
  app.get("/api/health", (req, res) => { res.json({ status: "ok" }); });

  app.get("/api/dashboard", (req, res) => {
    res.json({
      stats: { activeEsims: 3, dataUsed: 12.5, expiryInDays: 2, wallet: 24.50 },
      esims: [
        { id: '1', country: 'France', data: 7.2, total: 10, validity: '30 Days', status: 'Active', expiry: '2025-06-05' },
        { id: '2', country: 'United States', data: 2.1, total: 5, validity: '15 Days', status: 'Active', expiry: '2025-06-09' },
        { id: '3', country: 'Turkey', data: 1.2, total: 3, validity: '7 Days', status: 'Active', expiry: '2025-06-04' },
      ],
      quickActions: [
        { id: '1', name: 'Buy eSIM' },
        { id: '2', name: 'Top Up' },
        { id: '3', name: 'Send eSIM' },
        { id: '4', name: 'Add Number' },
        { id: '5', name: 'Help Center' },
        { id: '6', name: 'Invite Friends' },
      ],
      dataUsage: [
        { name: 'France', value: 7.2 },
        { name: 'United States', value: 2.1 },
        { name: 'Turkey', value: 1.2 },
        { name: 'Other', value: 2.0 },
      ],
      recentTransactions: [
        { id: '1', title: 'eSIM - France 10GB', date: '2025-05-10', amount: -22.90, status: 'Completed' },
        { id: '2', title: 'Top Up Wallet', date: '2025-05-09', amount: 50.00, status: 'Completed' },
        { id: '3', title: 'eSIM - USA 5GB', date: '2025-05-08', amount: -15.90, status: 'Completed' },
      ]
    });
  });

  app.post("/api/recommend-plans", async (req, res) => {
    const { plans, userUsage } = req.body;
    
    async function generateWithRetry(prompt: string, retries = 3): Promise<string> {
      try {
        const aiClient = getAiClient();
        const response = await aiClient.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });
        return response.text!;
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return generateWithRetry(prompt, retries - 1);
        }
        throw error;
      }
    }
    
    try {
      const prompt = `Based on the following user usage patterns: ${JSON.stringify(userUsage)}, recommend the best 3 plans from this list: ${JSON.stringify(plans)}. Return ONLY a JSON list of plan IDs.`;
      
      const responseText = await generateWithRetry(prompt);
      
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("Error recommending plans:", error);
      res.status(503).json({ error: "Gemini is busy, please try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log("Serving static from:", distPath);
    console.log("Files:", require('fs').readdirSync(distPath));
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
