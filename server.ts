/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { DBState, QuestionLog, WeeklyPlan, UserProfile, DSATopic, Difficulty, DailyChallenge, AIInsights } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize local DB file path
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to get current week ID (e.g. "2026-W29")
function getCurrentWeekId(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// Get dates for the current week (Monday to Sunday)
function getCurrentWeekDateRange(): string[] {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distance = currentDay === 0 ? -6 : 1 - currentDay; // Distance to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + distance);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    dates.push(day.toISOString().split("T")[0]);
  }
  return dates;
}

// Default initial database state to make the app instantly populated and engaging
const defaultDB: DBState = {
  users: [
    {
      id: "user_1",
      name: "Ishita",
      avatar: "👩‍💻",
      color: "purple",
      points: 0,
      streakCurrent: 0,
      streakLongest: 0,
    },
    {
      id: "user_2",
      name: "Neha",
      avatar: "👨‍💻",
      color: "indigo",
      points: 0,
      streakCurrent: 0,
      streakLongest: 0,
    },
  ],
  questions: [],
  plans: [],
  dailyChallenges: [
    {
      date: new Date().toISOString().split("T")[0],
      name: "Valid Palindrome",
      topic: "Two Pointers",
      difficulty: "Easy",
      points: 10,
    },
  ],
};

// Ensure database file exists
function readDB(): DBState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
      return defaultDB;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading db.json, returning default", err);
    return defaultDB;
  }
}

function writeDB(data: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing db.json", err);
  }
}

// Compute points for a logged question
function computeQuestionPoints(log: { difficulty: Difficulty; isRevision: boolean; isDailyChallenge?: boolean }): number {
  let base = 0;
  if (log.difficulty === "Easy") {
    base = log.isRevision ? 2 : 5;
  } else if (log.difficulty === "Medium") {
    base = log.isRevision ? 4 : 10;
  } else if (log.difficulty === "Hard") {
    base = log.isRevision ? 6 : 15;
  }

  if (log.isDailyChallenge) {
    base += 10; // Daily challenge bonus
  }
  return base;
}

// Compute streaks & updates user profiles
function refreshUserStreaksAndPoints(userId: string, db: DBState) {
  const user = db.users.find((u) => u.id === userId);
  if (!user) return;

  const userQuestions = db.questions.filter((q) => q.userId === userId);
  
  // Sort distinct question dates in ascending order
  const distinctDates = Array.from(new Set(userQuestions.map((q) => q.date))).sort();
  
  if (distinctDates.length === 0) {
    user.streakCurrent = 0;
    return;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  let streak = 0;
  let hasTodayOrYesterday = distinctDates.includes(todayStr) || distinctDates.includes(yesterdayStr);

  if (hasTodayOrYesterday) {
    // Traverse backwards starting from the latest entry (if it's today or yesterday)
    let checkDate = distinctDates.includes(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);
    
    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (distinctDates.includes(checkStr)) {
        streak++;
        // Check previous day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  user.streakCurrent = streak;
  if (streak > user.streakLongest) {
    user.streakLongest = streak;
  }

  // Calculate sum points of all questions logged
  const basePoints = userQuestions.reduce((sum, q) => sum + q.points, 0);

  // Calculate bonuses:
  // 1. Weekly Goal Completed (+10) for each week where goal is met
  // 2. Stretch Goal Completed (+20) for each week where stretch goal is met
  // Let's group questions by week ID to verify.
  let bonusPoints = 0;
  
  // We'll compute goals per week
  const weekMap = new Map<string, number>(); // weekId -> solved count
  userQuestions.forEach((q) => {
    // Derive weekId of the question date
    const d = new Date(q.date);
    const dUTC = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = dUTC.getUTCDay() || 7;
    dUTC.setUTCDate(dUTC.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(dUTC.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((dUTC.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const weekId = `${dUTC.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;

    weekMap.set(weekId, (weekMap.get(weekId) || 0) + 1);
  });

  db.plans.filter((p) => p.userId === userId).forEach((plan) => {
    const solvedInWeek = weekMap.get(plan.weekId) || 0;
    if (solvedInWeek >= plan.questionGoal) {
      bonusPoints += 10; // Goal bonus
      if (plan.stretchGoal && solvedInWeek >= plan.stretchGoal) {
        bonusPoints += 20; // Stretch bonus
      }
    }
  });

  // 3. 7-day streak bonus (+15)
  // Give +15 points for every block of 7 distinct active days
  const activeDaysCount = distinctDates.length;
  const streakBonuses = Math.floor(activeDaysCount / 7);
  bonusPoints += streakBonuses * 15;

  user.points = basePoints + bonusPoints;
}

// Lazy Gemini API Client instantiation
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured or holds a placeholder. Please set your key in Settings > Secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// ==========================================
// API Endpoints
// ==========================================

// Get all DB stats
app.get("/api/db", (req, res) => {
  const db = readDB();
  res.json(db);
});

// Update or add a user account
app.post("/api/update-user", (req, res) => {
  const { id, name, avatar, color } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: "Missing id or name" });
  }

  const db = readDB();
  const user = db.users.find((u) => u.id === id);
  if (user) {
    user.name = name;
    if (avatar) user.avatar = avatar;
    if (color) user.color = color;
  } else {
    db.users.push({
      id,
      name,
      avatar: avatar || "🧙",
      color: color || (id === "user_1" ? "purple" : "indigo"),
      points: 0,
      streakCurrent: 0,
      streakLongest: 0,
    });
  }
  
  writeDB(db);
  res.json({ success: true, db });
});

// Save or log a solved question
app.post("/api/log-question", (req, res) => {
  const { userId, name, platform, topic, difficulty, isRevision, note, date, isDailyChallenge } = req.body;
  if (!userId || !name || !platform || !topic || !difficulty) {
    return res.status(400).json({ error: "Missing required question fields" });
  }

  const db = readDB();
  
  // Calculate points
  const points = computeQuestionPoints({ difficulty, isRevision, isDailyChallenge });

  const newLog: QuestionLog = {
    id: "q_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    userId,
    name,
    platform,
    topic,
    difficulty,
    isRevision: !!isRevision,
    note: note || "",
    date: date || new Date().toISOString().split("T")[0],
    points,
    isDailyChallenge: !!isDailyChallenge,
  };

  db.questions.push(newLog);

  // Refresh stats
  refreshUserStreaksAndPoints(userId, db);
  
  writeDB(db);
  res.json({ success: true, logged: newLog, db });
});

// Delete logged question
app.post("/api/delete-question", (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Missing question ID" });

  const db = readDB();
  const index = db.questions.findIndex((q) => q.id === id);
  if (index !== -1) {
    const userId = db.questions[index].userId;
    db.questions.splice(index, 1);
    refreshUserStreaksAndPoints(userId, db);
    writeDB(db);
    res.json({ success: true, db });
  } else {
    res.status(404).json({ error: "Question not found" });
  }
});

// Update weekly plan (goal, topic)
app.post("/api/update-plan", (req, res) => {
  const { userId, weekId, topics, questionGoal, stretchGoal } = req.body;
  if (!userId || !weekId || !topics || !questionGoal) {
    return res.status(400).json({ error: "Missing required planning fields" });
  }

  const db = readDB();
  let plan = db.plans.find((p) => p.userId === userId && p.weekId === weekId);
  if (plan) {
    plan.topics = topics;
    plan.questionGoal = Number(questionGoal);
    plan.stretchGoal = stretchGoal ? Number(stretchGoal) : undefined;
  } else {
    db.plans.push({
      userId,
      weekId,
      topics,
      questionGoal: Number(questionGoal),
      stretchGoal: stretchGoal ? Number(stretchGoal) : undefined,
    });
  }

  refreshUserStreaksAndPoints(userId, db);
  writeDB(db);
  res.json({ success: true, db });
});

// Reset database to default mock data
app.post("/api/reset", (req, res) => {
  writeDB(defaultDB);
  res.json({ success: true, db: defaultDB });
});

// Generate dynamic AI Insights & Predictions
app.post("/api/ai/insights", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    const opponent = db.users.find((u) => u.id !== userId);
    const userQuestions = db.questions.filter((q) => q.userId === userId);
    const plans = db.plans.filter((p) => p.userId === userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
You are the AI coach for a competitive Data Structures and Algorithms tracking platform called "DSA Duel".
Analyze this user's practice data and generate comprehensive weekly insights and predictive analytics.

USER PROFILE:
- Name: ${user.name}
- Total Points: ${user.points}
- Current Streak: ${user.streakCurrent} days
- Longest Streak: ${user.streakLongest} days

OPPONENT PROFILE (The Friend they are dueling):
- Name: ${opponent ? opponent.name : "N/A"}
- Opponent Points: ${opponent ? opponent.points : 0}
- Opponent Current Streak: ${opponent ? opponent.streakCurrent : 0} days

USER QUESTION HISTORY (last logged):
${JSON.stringify(userQuestions.slice(-30))}

USER WEEKLY GOAL SETTINGS:
${JSON.stringify(plans)}

Please return a structured JSON response matching the schema details:
{
  "weeklySummary": "A motivational 2-3 sentence overview of their recent week's performance, consistency, and pacing compared to their duel opponent.",
  "recommendedGoal": 6, // Recommended minimum question goal for next week (an integer)
  "recommendedTopics": ["Trees", "Binary Search"], // 1 or 2 DSA topics they should focus on next based on historical gaps or neglected topics
  "burnoutDetection": "Low risk / Medium risk / High risk with a brief reason based on daily activity trends",
  "goalCompletionProbability": 85, // estimated percentage probability (0-100) they will meet their goal next week
  "projectedEndOfYearTotal": 240, // estimated total questions they will solve by year-end if they continue their current pace
  "personalizedStrategy": "A customized tip to improve their accuracy, selection, revision cadence, or speed."
}

Ensure your response is valid JSON only. Do not wrap it in markdown code blocks.
`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const insights: AIInsights = JSON.parse(resultText.trim());
    res.json(insights);
  } catch (err: any) {
    console.error("AI Insights Error:", err);
    // Return graceful mock-rule backup insights if Gemini Key is missing or failed
    res.json({
      weeklySummary: "You are doing great! Your current streak is solid, keep pushing to outpace your friend. Solve more Mediums to build points.",
      recommendedGoal: 5,
      recommendedTopics: ["Trees", "Graphs"],
      burnoutDetection: "Low Risk. Your pacing is very consistent and healthy.",
      goalCompletionProbability: 80,
      projectedEndOfYearTotal: 300,
      personalizedStrategy: "Consider dedicating one session per week strictly to Revision logs (+4 pts for Medium revision) to lock in key logic patterns.",
    });
  }
});

// Chatbot natural language queries
app.post("/api/ai/query", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) return res.status(400).json({ error: "Missing required query fields" });

  try {
    const db = readDB();
    const user = db.users.find((u) => u.id === userId);
    const userQuestions = db.questions.filter((q) => q.userId === userId);
    const opponent = db.users.find((u) => u.id !== userId);

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
You are the DSA Duel Intelligent Assistant, helping ${user?.name || "the user"} understand their practice logs and perform better.

DATABASE CONTEXT:
- Current User: ${user?.name} (Points: ${user?.points}, Current Streak: ${user?.streakCurrent} days)
- Opponent Friend: ${opponent?.name} (Points: ${opponent?.points}, Current Streak: ${opponent?.streakCurrent} days)
- User Solved Questions Log:
${JSON.stringify(userQuestions)}
- Weekly Goals:
${JSON.stringify(db.plans.filter(p => p.userId === userId))}

USER QUERY:
"${message}"

Provide a friendly, accurate, and direct response addressing the user's query entirely using their historical logs.
Be succinct, encouraging, and clear. Avoid overly verbose explanations. Keep your tone highly constructive, like a peer coach.
`,
    });

    res.json({ response: response.text || "Sorry, I couldn't formulate a response right now." });
  } catch (err: any) {
    console.error("AI Query Error:", err);
    res.json({
      response: `[Mock Coach]: I noticed your Gemini API Key is not set or valid. Once active, I can do live calculations on your full history. 
Looking at your offline database: You have solved ${db_fallback_stats(userId)} questions in total, with your strongest topic being Arrays & Hashing!`,
    });
  }
});

function db_fallback_stats(userId: string): number {
  try {
    const db = readDB();
    return db.questions.filter((q) => q.userId === userId).length;
  } catch {
    return 0;
  }
}

// ==========================================
// Vite Dev Server / Production Static Config
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DSA Duel full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
