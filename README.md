# ⚔️ DSA Duel

**A high-fidelity, gamified, and competitive DSA practice tracker and analyzer designed for two friends to supercharge their technical interview preparation through friendly rivalry.**

DSA Duel transforms the often tedious grind of practicing Data Structures & Algorithms into an engaging, head-to-head competition. It features real-time progress syncing, dynamic point calculations, interactive visual analytics, a rich achievement/badge system, and an integrated, server-side AI Coach powered by Gemini 3.5 Flash.

---

## 🎨 Core Design & Visual Philosophy

DSA Duel is built on a custom, highly polished **Modern High-Contrast Flat Design Theme** (inspired by Neobrutalism combined with clean, professional layouts):
- **Typography Pairing**: Features bold, energetic, and highly readable display typography pairing **Inter** (for UI controls) with **JetBrains Mono** (for statistics, numbers, and system readouts).
- **Crisp Cards**: Replaces standard generic dark gradients with clean, premium white cards defined by bold, structured borders (`border-b-4 border-r-4 border-[#E2E8F0]`) and spacious, rhythmic padding.
- **Aesthetic Accents**: Utilizes rich color palettes like deep indigo (`#1E1B4B`), vibrant purple (`#7C3AED`), emerald greens for solved states, and warm amber tones for motivation callouts.
- **Aesthetic Consistency**: Free of visual clatter, mock terminal outputs, or placeholder telemetry. Every element serves a real, interactive user experience.

---

## 🚀 Complete Feature Breakdown

### 1. 📊 Real-Time Interactive Leaderboards
- **Head-to-Head Standing**: Visualizes live score tallies, active consecutive day streaks, and total solved counts side-by-side.
- **Dynamic Streak Multipliers**: Promotes consistency. Logged questions completed on consecutive days grow active streaks, which automatically trigger additional **Streak Bonuses (+15 points per block of 7 active days)**.
- **Weekly Duel Winners Log**: Captures and displays historically completed weeks, documenting who earned the crown and the weekly point totals.

### 2. ✍️ Advanced Question Logger & Planner
- **Multi-Platform Support**: Log submissions from LeetCode, HackerRank, GeeksforGeeks, CodeStudio, or other custom platforms.
- **Topic & Difficulty Mapping**: Catalog submissions across 12+ primary DSA topics and rate difficulties (Easy, Medium, Hard).
- **Smart Revision Cadence**: Practice isn't just about new questions. Toggle **Revision Mode** to log repeated practice at custom, balanced point scales (Easy: 5 pts new / 2 pts revision; Medium: 10 pts new / 4 pts revision; Hard: 15 pts new / 6 pts revision) to promote retention.
- **Weekly Practice Contracts**: Set personal weekly goals and stretch goals alongside dedicated focus topics. Meeting your goals awards **Weekly Goal Completion (+10 points)** and **Stretch Goal Completion (+20 points)**.

### 3. 🔥 GitHub-Style Activity Heatmap & Calendar Grid
- **12-Week Rolling Heatmap**: Features a clean, green-shaded contribution grid mapping daily DSA practice intensity over the past 12 weeks.
- **Interactive Monthly Calendar**: Includes a standard, highly functional calendar view highlighting daily active counts.
- **Inspect Specific Dates**: Clicking on any shaded cell on either the heatmap or the calendar populates a detailed panel listing all specific questions, difficulties, and custom note logs compiled by both participants on that date.

### 4. 📈 Interactive Analytics & Recharts Data Visualizations
- **Head-to-Head Duel Stats**: A direct tabular comparison detailing total points, solved totals, streaks, strongest categories, and platform distributions.
- **Points Cumulative Distribution Area Chart**: Graphically tracks point trends and growth over time for both users.
- **Difficulty Mix Pie Charts**: Two side-by-side charts illustrating the percentage ratio of Easy vs. Medium vs. Hard problems solved by each duelist.
- **Topic Distribution Bar Chart**: Compares the total volume of questions solved per DSA topic (Trees, Graphs, Arrays, Dynamic Programming, etc.).
- **Mastery Progress Indicators**: Dynamic progress bars showing user completion rates and coverage of core algorithms.

### 5. 🏆 Gamified Badges & Achievements System
- **14 Unlockable Milestones**: Includes custom milestones for consistency (e.g., 3-day, 7-day, 14-day streaks), topic specialization (e.g., Array Master, Graph Guru), and difficulty hurdles.
- **Rarity & Tier Classifications**: Categorized across **Common, Uncommon, Rare, Epic, and Legendary** rarities and graded from **Bronze, Silver, Gold, Platinum, Diamond, up to Master** tiers.
- **Competitive Ownership States**: Badges are dynamic. Each card clearly outlines which duelist has unlocked the achievement first or if they have both conquered it.

### 6. 🧠 Server-Side AI Performance Coach
- **AI Performance Insights**: Powered by Gemini 3.5 Flash, the coach automatically inspects your collective historical database to deliver:
  - **Goal Completion Probability**: A percentage probability estimate of meeting next week's goal.
  - **Year-End Projections**: Dynamic estimation of total solved questions by year-end based on active pacing.
  - **Burnout Index**: Analyzes spacing between active days to warn you of burnout risk.
  - **Recommended Topics & Goals**: Outlines precisely which DSA topics you should target next.
  - **Personalized Strategies**: Actionable, diagnostic tips custom-tailored to your current practice patterns.
- **Interactive Chat Console**: A fully responsive peer-coaching chatbot contextualized with your complete practice history, streaks, and active goals. Ask the coach direct questions about your performance, weak areas, or revision planning.

---

## 🛠️ Architecture & Core Technologies

DSA Duel is designed with a robust, production-grade **Full-Stack Architecture**:

- **Client-Side (SPA)**:
  - **React 18+** with **Vite** as the build pipeline.
  - **Tailwind CSS** for rapid, responsive, custom component layout.
  - **Lucide React** for crisp, scalable line icons.
  - **Recharts** for performant SVG chart animations.
  - **Motion** (`motion/react`) for smooth, non-intrusive transition states.

- **Server-Side (Express)**:
  - **Node.js + Express** serving the production-built SPA static assets and handling all state APIs.
  - **Local Persistence Layer**: Integrated JSON-based database (`db.json`) synced dynamically on every submission. Highly resilient, including custom schema recovery and prepopulated default seeds.
  - **Secure API Proxying**: Employs the modern `@google/genai` SDK on the server, ensuring that sensitive credentials (like `GEMINI_API_KEY`) remain securely hidden and are never exposed to the client browser.
  - **Graceful Local Fallbacks**: If a Gemini API Key is missing or invalid, the server automatically recovers, returning diagnostic rule-based insights and offline data summaries.

---

## ⚙️ Development & Local Startup Instructions

To run DSA Duel locally on your machine:

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **NPM** installed.

### 2. Installation
Clone the repository, navigate to the directory, and install dependencies:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Gemini API Key. Refer to `.env.example` as a template:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*Note: The app compiles and operates perfectly in offline mode using smart mock fallbacks if no API key is specified.*

### 4. Start Development Server
Run the full-stack server in development mode:
```bash
npm run dev
```
The server will start on port `3000`. Open `http://localhost:3000` in your browser. Vite handles automatic hot-reloads for frontend changes, while the Express API manages backend endpoints.

---

## 🚢 Production Deployment Guide

DSA Duel is optimized for seamless cloud container compilation and hosting.

### 1. Automatic Deployment via AI Studio (Recommended)
Because this workspace runs in a fully managed environment on Cloud Run, deploying your app is simple:
1. Click the **Deploy** or **Share** workflow options inside Google AI Studio.
2. The platform automatically triggers a containerized build process, compiling static assets, bundling the backend, provisioning resources, and serving your live application under secure, auto-assigned URLs.
3. Manage API keys and credentials securely using the **Settings > Secrets** panel inside the AI Studio editor.

### 2. Manual Production Compilations
To compile a standalone, optimized build ready for any Node.js environment:
1. **Build Step**:
   ```bash
   npm run build
   ```
   This command executes a dual pipeline:
   - Compiles client assets into highly optimized, minified static files within `/dist/`.
   - Bundles the backend `server.ts` into a single, self-contained CommonJS file located at `dist/server.cjs` using `esbuild`. This bypasses relative path resolution constraints at runtime, creating a high-performance start file.
2. **Launch Step**:
   ```bash
   npm start
   ```
   This executes the compiled backend directly using `node dist/server.cjs` in production mode (using port `3000` and binding to `0.0.0.0`).

### 3. Custom Hosting Platforms
You can easily deploy the compiled output to standard cloud environments:

#### Render, Heroku, or VPS
1. Link your repository.
2. Set the build command to: `npm install && npm run build`
3. Set the start command to: `npm start`
4. Set the environment variables:
   - `NODE_ENV=production`
   - `GEMINI_API_KEY=your_gemini_key`

#### Containerized Deployment (Docker)
You can build and run DSA Duel as a lightweight container. Create a `Dockerfile` in the root:

```dockerfile
# Base image
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production runtime image
FROM node:18-alpine

WORKDIR /app

# Copy built assets and production manifests
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/db.json ./db.json

# Install production dependencies only
RUN npm ci --only=production

# Set environment
ENV NODE_ENV=production
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
```

Build and run your container locally or push to Google Artifact Registry:
```bash
docker build -t dsa-duel .
docker run -p 3000:3000 -e GEMINI_API_KEY="your_key" dsa-duel
```
