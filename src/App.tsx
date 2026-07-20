/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Trophy, Flame, PlusCircle, BookOpen, BarChart3, Calendar, Award, BrainCircuit, 
  RefreshCw, Wifi, WifiOff, RotateCcw, Swords
} from "lucide-react";

import Dashboard from "./components/Dashboard";
import QuestionLogger from "./components/QuestionLogger";
import Leaderboards from "./components/Leaderboards";
import HistoryList from "./components/HistoryList";
import AnalyticsPanel from "./components/AnalyticsPanel";
import HeatmapCalendar from "./components/HeatmapCalendar";
import BadgesPanel from "./components/BadgesPanel";
import AICoach from "./components/AICoach";

import { UserProfile, QuestionLog, WeeklyPlan, DailyChallenge, DBState, DSATopic } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "log" | "leaderboards" | "history" | "analytics" | "heatmap" | "badges" | "ai">("dashboard");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [questions, setQuestions] = useState<QuestionLog[]>([]);
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("user_1");
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch all state from full-stack server
  const loadData = async () => {
    try {
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Server error");
      const data: DBState = await res.json();
      
      setUsers(data.users);
      setQuestions(data.questions);
      setPlans(data.plans || []);
      setDailyChallenges(data.dailyChallenges || []);
      setIsOffline(false);

      // Attempt to sync any unsynced offline logs
      syncOfflineQueue();
    } catch (err) {
      console.warn("Failed to reach backend server, fallback to offline local state", err);
      setIsOffline(true);
      loadOfflineFallback();
    }
  };

  // Load offline data fallback from localStorage
  const loadOfflineFallback = () => {
    const cachedUsers = localStorage.getItem("dsa_duel_users");
    const cachedQuestions = localStorage.getItem("dsa_duel_questions");
    const cachedPlans = localStorage.getItem("dsa_duel_plans");
    const cachedChallenges = localStorage.getItem("dsa_duel_challenges");

    if (cachedUsers) setUsers(JSON.parse(cachedUsers));
    if (cachedQuestions) setQuestions(JSON.parse(cachedQuestions));
    if (cachedPlans) setPlans(JSON.parse(cachedPlans));
    if (cachedChallenges) setDailyChallenges(JSON.parse(cachedChallenges));
  };

  // Save state to localStorage whenever changed
  useEffect(() => {
    if (users.length > 0) localStorage.setItem("dsa_duel_users", JSON.stringify(users));
    if (questions.length > 0) localStorage.setItem("dsa_duel_questions", JSON.stringify(questions));
    if (plans.length > 0) localStorage.setItem("dsa_duel_plans", JSON.stringify(plans));
    if (dailyChallenges.length > 0) localStorage.setItem("dsa_duel_challenges", JSON.stringify(dailyChallenges));
  }, [users, questions, plans, dailyChallenges]);

  // Sync offline queue to backend when online
  const syncOfflineQueue = async () => {
    const queueStr = localStorage.getItem("dsa_duel_offline_queue");
    if (!queueStr) return;

    const queue: any[] = JSON.parse(queueStr);
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      for (const item of queue) {
        await fetch("/api/log-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
      }
      // Success, empty queue
      localStorage.removeItem("dsa_duel_offline_queue");
      // Reload master state
      const res = await fetch("/api/db");
      const data: DBState = await res.json();
      setUsers(data.users);
      setQuestions(data.questions);
      setPlans(data.plans || []);
    } catch (err) {
      console.error("Retry sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add listener for network status changes
  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOffline(false);
      syncOfflineQueue();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Post or log a new question
  const handleLogQuestion = async (logInput: {
    name: string;
    platform: string;
    topic: DSATopic;
    difficulty: "Easy" | "Medium" | "Hard";
    isRevision: boolean;
    note?: string;
    date: string;
    isDailyChallenge?: boolean;
  }) => {
    const payload = { userId: currentUserId, ...logInput };

    if (isOffline) {
      // Offline implementation: calculate locally and queue
      const offlineId = "offline_" + Date.now();
      let points = 0;
      if (logInput.difficulty === "Easy") points = logInput.isRevision ? 2 : 5;
      else if (logInput.difficulty === "Medium") points = logInput.isRevision ? 4 : 10;
      else points = logInput.isRevision ? 6 : 15;

      if (logInput.isDailyChallenge) points += 10;

      const offlineLog: QuestionLog = {
        id: offlineId,
        userId: currentUserId,
        ...logInput,
        points,
      };

      // Append to local state
      const updatedQuestions = [...questions, offlineLog];
      setQuestions(updatedQuestions);

      // Save to queue
      const queueStr = localStorage.getItem("dsa_duel_offline_queue") || "[]";
      const queue = JSON.parse(queueStr);
      queue.push(payload);
      localStorage.setItem("dsa_duel_offline_queue", JSON.stringify(queue));

      // Calculate streak locally
      const updatedUsers = users.map((u) => {
        if (u.id === currentUserId) {
          const userLogs = updatedQuestions.filter((q) => q.userId === currentUserId);
          const distinctDates = Array.from(new Set(userLogs.map((q) => q.date))).sort();
          return {
            ...u,
            points: u.points + points,
            streakCurrent: distinctDates.length, // Simpler fallback streak
          };
        }
        return u;
      });
      setUsers(updatedUsers);
      return;
    }

    try {
      const res = await fetch("/api/log-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Log failed");
      const data = await res.json();
      setUsers(data.db.users);
      setQuestions(data.db.questions);
    } catch (err) {
      console.error(err);
      setIsOffline(true);
      // Retry in offline mode
      handleLogQuestion(logInput);
    }
  };

  // Log daily challenge completion
  const handleLogDailyChallenge = (challenge: DailyChallenge) => {
    handleLogQuestion({
      name: challenge.name,
      platform: "LeetCode",
      topic: challenge.topic,
      difficulty: challenge.difficulty,
      isRevision: false,
      note: "Successfully solved the custom daily coding challenge!",
      date: challenge.date,
      isDailyChallenge: true,
    });
  };

  // Update planning settings
  const handleUpdatePlan = async (planInput: { topics: DSATopic[]; questionGoal: number; stretchGoal?: number }) => {
    const currentWeekId = getCurrentWeekId();
    const payload = {
      userId: currentUserId,
      weekId: currentWeekId,
      ...planInput,
    };

    if (isOffline) {
      const updatedPlans = plans.filter(p => !(p.userId === currentUserId && p.weekId === currentWeekId));
      updatedPlans.push({ userId: currentUserId, weekId: currentWeekId, ...planInput });
      setPlans(updatedPlans);
      return;
    }

    try {
      const res = await fetch("/api/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Plan update failed");
      const data = await res.json();
      setPlans(data.db.plans);
      setUsers(data.db.users);
    } catch (err) {
      console.error(err);
    }
  };

  // Update user profile details
  const handleUpdateUserProfile = async (userId: string, newName: string, newAvatar: string, newColor: string) => {
    if (isOffline) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, name: newName, avatar: newAvatar, color: newColor } : u)));
      return;
    }

    try {
      const res = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, name: newName, avatar: newAvatar, color: newColor }),
      });
      if (!res.ok) throw new Error("User update failed");
      const data = await res.json();
      setUsers(data.db.users);
    } catch (err) {
      console.error(err);
    }
  };

  // Delete logged question
  const handleDeleteQuestion = async (id: string) => {
    if (isOffline) {
      setQuestions(questions.filter((q) => q.id !== id));
      return;
    }

    try {
      const res = await fetch("/api/delete-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      const data = await res.json();
      setQuestions(data.db.questions);
      setUsers(data.db.users);
    } catch (err) {
      console.error(err);
    }
  };

  // Reset database back to default populated state
  const handleResetDB = async () => {
    if (confirm("Reset everything to default prepopulated history? This is great for showcasing the app!")) {
      try {
        const res = await fetch("/api/reset", { method: "POST" });
        const data = await res.json();
        setUsers(data.db.users);
        setQuestions(data.db.questions);
        setPlans(data.db.plans);
        setDailyChallenges(data.db.dailyChallenges);
        localStorage.clear();
        alert("Database successfully reset!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getCurrentWeekId = () => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const currentUser = users.find((u) => u.id === currentUserId) || { id: "user_1", name: "Ishita", avatar: "👩‍💻", color: "purple", points: 0, streakCurrent: 0, streakLongest: 0 };
  const friendUser = users.find((u) => u.id !== currentUserId) || { id: "user_2", name: "Neha", avatar: "👨‍💻", color: "indigo", points: 0, streakCurrent: 0, streakLongest: 0 };

  // Map user names for easy access in history lists
  const userNamesMap = users.reduce((acc, curr) => {
    acc[curr.id] = curr.name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-[#1E293B] flex flex-col font-sans selection:bg-[#7C3AED] selection:text-white">
      {/* Upper Navigation Bar / Branding header */}
      <header className="border-b-4 border-[#E2E8F0] bg-white sticky top-0 z-40 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-[#7C3AED] p-2 rounded-xl text-white shadow-lg shadow-purple-200">
            <Swords size={20} className="animate-bounce" />
          </div>
          <div>
            <span className="font-extrabold text-[#1E1B4B] text-lg tracking-tight font-sans">DSA Duel</span>
            <span className="text-[10px] text-[#7C3AED] font-bold block leading-none tracking-widest uppercase">Competitive Prep</span>
          </div>
        </div>

        {/* Sync & Connection Status indicators */}
        <div className="flex items-center gap-3">
          {isOffline ? (
            <span className="bg-red-50 text-red-600 border-2 border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
              <WifiOff size={11} />
              OFFLINE MODE
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 border-2 border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-mono">
              <Wifi size={11} />
              SYNCED
            </span>
          )}

          {isSyncing && (
            <span className="text-xs text-[#1E293B] animate-pulse flex items-center gap-1 font-mono">
              <RefreshCw size={12} className="animate-spin text-[#7C3AED]" />
              Syncing...
            </span>
          )}

          <button
            onClick={handleResetDB}
            className="p-1.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-[#7C3AED] transition-all border-2 border-[#E2E8F0] rounded-xl cursor-pointer"
            title="Reset Database to default prepopulated state"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Main Navigation tabs */}
      <div className="bg-white px-4 border-b-2 border-[#E2E8F0] overflow-x-auto scrollbar-thin">
        <nav className="flex gap-1.5 py-2.5 min-w-[700px]">
          {[
            { id: "dashboard", label: "Dashboard", icon: <Trophy size={14} /> },
            { id: "log", label: "Log Question", icon: <PlusCircle size={14} /> },
            { id: "leaderboards", label: "Leaderboards", icon: <Award size={14} /> },
            { id: "history", label: "History Log", icon: <BookOpen size={14} /> },
            { id: "analytics", label: "Analytics & Progress", icon: <BarChart3 size={14} /> },
            { id: "heatmap", label: "Heatmap & Calendar", icon: <Calendar size={14} /> },
            { id: "badges", label: "Badges Board", icon: <Award size={14} /> },
            { id: "ai", label: "AI Duel Coach", icon: <BrainCircuit size={14} /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-2 ${
                  isSelected
                    ? "bg-[#F5F3FF] text-[#7C3AED] border-[#C7D2FE] shadow-sm shadow-purple-100 font-bold"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-transparent"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Primary body view content container */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full pb-16">
        {activeTab === "dashboard" && (
          <Dashboard
            currentUser={currentUser}
            friendUser={friendUser}
            questions={questions}
            plans={plans}
            dailyChallenges={dailyChallenges}
            onSwitchUser={setCurrentUserId}
            onUpdatePlan={handleUpdatePlan}
            onLogDailyChallenge={handleLogDailyChallenge}
            onUpdateUserProfile={handleUpdateUserProfile}
          />
        )}

        {activeTab === "log" && (
          <QuestionLogger
            userId={currentUser.id}
            userName={currentUser.name}
            onLogQuestion={handleLogQuestion}
          />
        )}

        {activeTab === "leaderboards" && (
          <Leaderboards
            users={users}
            questions={questions}
          />
        )}

        {activeTab === "history" && (
          <HistoryList
            questions={questions}
            userNames={userNamesMap}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}

        {activeTab === "analytics" && (
          <AnalyticsPanel
            users={users}
            questions={questions}
          />
        )}

        {activeTab === "heatmap" && (
          <HeatmapCalendar
            questions={questions}
            userNames={userNamesMap}
          />
        )}

        {activeTab === "badges" && (
          <BadgesPanel
            currentUser={currentUser}
            friendUser={friendUser}
            questions={questions}
          />
        )}

        {activeTab === "ai" && (
          <AICoach
            currentUser={currentUser}
          />
        )}
      </main>

      {/* Footer copyright */}
      <footer className="border-t-2 border-[#E2E8F0] bg-white py-4 text-center text-[10px] text-gray-500 font-mono">
        DSA DUEL PLATFORM © 2026 • BUILT FOR ISHITA & FRIEND • PERSISTENT OFFLINE STORAGE SYNC ACTIVE
      </footer>
    </div>
  );
}
