/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Trophy, Flame, Target, Star, Calendar, ArrowRight, CheckCircle2, AlertCircle, Edit3, Plus, RefreshCw, LogIn
} from "lucide-react";
import { UserProfile, WeeklyPlan, QuestionLog, DSATopic, DailyChallenge, Difficulty } from "../types";
import { DSA_TOPICS, generateMotivationMessage } from "../lib/dsaUtils";

export const COLOR_MAP: Record<string, {
  primary: string;
  bg: string;
  text: string;
  border: string;
  gradient: string;
}> = {
  purple: {
    primary: "#7C3AED",
    bg: "bg-[#F5F3FF]",
    text: "text-[#7C3AED]",
    border: "border-[#E0D8FF]",
    gradient: "from-purple-500/5 to-transparent",
  },
  indigo: {
    primary: "#4F46E5",
    bg: "bg-[#EEF2FF]",
    text: "text-[#4F46E5]",
    border: "border-[#D2D6FF]",
    gradient: "from-indigo-500/5 to-transparent",
  },
  blue: {
    primary: "#2563EB",
    bg: "bg-[#EFF6FF]",
    text: "text-[#2563EB]",
    border: "border-[#DBEAFE]",
    gradient: "from-blue-500/5 to-transparent",
  },
  rose: {
    primary: "#E11D48",
    bg: "bg-[#FFF1F2]",
    text: "text-[#E11D48]",
    border: "border-[#FFE4E6]",
    gradient: "from-rose-500/5 to-transparent",
  },
  emerald: {
    primary: "#059669",
    bg: "bg-[#ECFDF5]",
    text: "text-[#059669]",
    border: "border-[#D1FAE5]",
    gradient: "from-emerald-500/5 to-transparent",
  },
  orange: {
    primary: "#EA580C",
    bg: "bg-[#FFF7ED]",
    text: "text-[#EA580C]",
    border: "border-[#FFEDD5]",
    gradient: "from-orange-500/5 to-transparent",
  },
};

interface DashboardProps {
  currentUser: UserProfile;
  friendUser: UserProfile;
  questions: QuestionLog[];
  plans: WeeklyPlan[];
  dailyChallenges: DailyChallenge[];
  onSwitchUser: (userId: string) => void;
  onUpdatePlan: (plan: { topics: DSATopic[]; questionGoal: number; stretchGoal?: number }) => void;
  onLogDailyChallenge: (challenge: DailyChallenge) => void;
  onUpdateUserProfile: (userId: string, newName: string, newAvatar: string, newColor: string) => void;
}

export default function Dashboard({
  currentUser,
  friendUser,
  questions,
  plans,
  dailyChallenges,
  onSwitchUser,
  onUpdatePlan,
  onLogDailyChallenge,
  onUpdateUserProfile,
}: DashboardProps) {
  const [isPlanning, setIsPlanning] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<DSATopic[]>([]);
  const [goalQuestions, setGoalQuestions] = useState(5);
  const [stretchGoalQuestions, setStretchGoalQuestions] = useState<number | "">("");

  // Profiles edit panel states
  const user1 = currentUser.id === "user_1" ? currentUser : friendUser;
  const user2 = currentUser.id === "user_2" ? currentUser : friendUser;

  const [isEditingProfiles, setIsEditingProfiles] = useState(false);
  const [p1Name, setP1Name] = useState(user1.name);
  const [p1Avatar, setP1Avatar] = useState(user1.avatar);
  const [p1Color, setP1Color] = useState(user1.color);

  const [p2Name, setP2Name] = useState(user2.name);
  const [p2Avatar, setP2Avatar] = useState(user2.avatar);
  const [p2Color, setP2Color] = useState(user2.color);

  React.useEffect(() => {
    setP1Name(user1.name);
    setP1Avatar(user1.avatar);
    setP1Color(user1.color);
    setP2Name(user2.name);
    setP2Avatar(user2.avatar);
    setP2Color(user2.color);
  }, [user1.name, user1.avatar, user1.color, user2.name, user2.avatar, user2.color]);

  // Get current week's plan for both users
  const getCurrentWeekId = () => {
    const now = new Date();
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const currentWeekId = getCurrentWeekId();
  const userPlan = plans.find((p) => p.userId === currentUser.id && p.weekId === currentWeekId);
  const friendPlan = plans.find((p) => p.userId === friendUser.id && p.weekId === currentWeekId);

  // Helper to filter questions logged this week (Monday to Sunday)
  const getQuestionsThisWeek = (userId: string) => {
    const now = new Date();
    const currentDay = now.getDay();
    const distance = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distance);
    monday.setHours(0, 0, 0, 0);

    return questions.filter((q) => {
      if (q.userId !== userId) return false;
      const qDate = new Date(q.date);
      return qDate >= monday;
    });
  };

  const userWeekLogs = getQuestionsThisWeek(currentUser.id);
  const friendWeekLogs = getQuestionsThisWeek(friendUser.id);

  // Points earned this week (from logs created this week)
  const userWeekPoints = userWeekLogs.reduce((sum, q) => sum + q.points, 0);
  const friendWeekPoints = friendWeekLogs.reduce((sum, q) => sum + q.points, 0);

  // Shared goal progress
  const sharedTarget = (userPlan?.questionGoal || 0) + (friendPlan?.questionGoal || 0);
  const sharedActual = userWeekLogs.length + friendWeekLogs.length;

  const handleStartPlanning = () => {
    if (userPlan) {
      setSelectedTopics(userPlan.topics);
      setGoalQuestions(userPlan.questionGoal);
      setStretchGoalQuestions(userPlan.stretchGoal || "");
    } else {
      setSelectedTopics([]);
      setGoalQuestions(5);
      setStretchGoalQuestions("");
    }
    setIsPlanning(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlan({
      topics: selectedTopics,
      questionGoal: goalQuestions,
      stretchGoal: stretchGoalQuestions === "" ? undefined : Number(stretchGoalQuestions),
    });
    setIsPlanning(false);
  };

  const toggleTopic = (topic: DSATopic) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  // Motivation meter string
  const motivationText = generateMotivationMessage(currentUser, friendUser, questions, plans);

  // Check if today's daily challenge is completed
  const todayStr = new Date().toISOString().split("T")[0];
  const challenge = dailyChallenges.find((c) => c.date === todayStr) || {
    date: todayStr,
    name: "Valid Palindrome",
    topic: "Two Pointers" as DSATopic,
    difficulty: "Easy" as Difficulty,
    points: 10,
  };

  const challengeCompleted = questions.some(
    (q) => q.userId === currentUser.id && q.date === todayStr && q.isDailyChallenge
  );

  const uColor = COLOR_MAP[currentUser.color] || COLOR_MAP.purple;
  const fColor = COLOR_MAP[friendUser.color] || COLOR_MAP.indigo;

  return (
    <div className="space-y-6">
      {/* User Switcher header */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{currentUser.avatar}</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#1E1B4B] flex items-center gap-1.5">
                Welcome, {currentUser.name}!
              </h1>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              You are currently logged in. Switch players to log practice questions for your friend.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsEditingProfiles(!isEditingProfiles)}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all border-2 border-[#E2E8F0] cursor-pointer shadow-xs"
          >
            <Edit3 size={12} style={{ color: uColor.primary }} />
            Customize Profiles
          </button>
          
          <div className="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-xl border-2 border-[#E2E8F0]">
            <span className="text-xs text-gray-500 px-2 font-bold font-mono uppercase tracking-wide">Dueling:</span>
            <button
              onClick={() => onSwitchUser(currentUser.id === "user_1" ? "user_2" : "user_1")}
              className="flex items-center gap-1.5 hover:opacity-90 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all border-b-2 border-r-2 active:border-b-0 active:border-r-0 cursor-pointer shadow-sm"
              style={{ backgroundColor: uColor.primary, borderColor: `${uColor.primary}cc` }}
            >
              <RefreshCw size={12} />
              Switch to {friendUser.name}
            </button>
          </div>
        </div>
      </div>

      {/* Profiles Customizer Collapsible Panel */}
      {isEditingProfiles && (
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] pb-3">
            <h3 className="font-extrabold text-sm text-[#1E1B4B] flex items-center gap-2">
              <span className="text-lg">🎨</span> Customize Duelist Profiles
            </h3>
            <button
              onClick={() => setIsEditingProfiles(false)}
              className="text-xs text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player 1 Settings */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase border-2 ${COLOR_MAP[p1Color]?.bg || "bg-purple-50"} ${COLOR_MAP[p1Color]?.text || "text-purple-600"} ${COLOR_MAP[p1Color]?.border || "border-purple-200"}`}>
                  Player 1 Details ({user1.name})
                </span>
                <span className="text-xs text-gray-400 font-mono">ID: {user1.id}</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                  Nickname / Handle
                </label>
                <input
                  type="text"
                  value={p1Name}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full bg-white border-2 border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  placeholder="Player 1 Name"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
                  Choose Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["👩‍💻", "👨‍💻", "🧙", "🐱", "🐶", "🚀", "🔥", "🦄", "🎯", "🤖", "🍕", "🧠", "🍀", "👾", "🏆"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setP1Avatar(emoji)}
                      className={`text-lg p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer ${
                        p1Avatar === emoji ? "bg-[#E0D8FF] border-2 border-[#7C3AED]" : "bg-white border-2 border-transparent"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
                  Choose Color Theme
                </label>
                <div className="flex gap-2">
                  {Object.keys(COLOR_MAP).map((colorKey) => {
                    const col = COLOR_MAP[colorKey];
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setP1Color(colorKey)}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                          p1Color === colorKey ? "border-[#1E1B4B] ring-2 ring-purple-200" : "border-transparent"
                        }`}
                        style={{ backgroundColor: col.primary }}
                        title={colorKey}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (p1Name.trim()) {
                    onUpdateUserProfile(user1.id, p1Name.trim(), p1Avatar, p1Color);
                  }
                }}
                className="w-full mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-extrabold py-2 rounded-xl transition-all border-b-2 border-r-2 border-purple-900 active:border-b-0 active:border-r-0 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                Save Player 1 Changes
              </button>
            </div>

            {/* Player 2 Settings */}
            <div className="bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase border-2 ${COLOR_MAP[p2Color]?.bg || "bg-indigo-50"} ${COLOR_MAP[p2Color]?.text || "text-indigo-600"} ${COLOR_MAP[p2Color]?.border || "border-indigo-200"}`}>
                  Player 2 Details ({user2.name})
                </span>
                <span className="text-xs text-gray-400 font-mono">ID: {user2.id}</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                  Nickname / Handle
                </label>
                <input
                  type="text"
                  value={p2Name}
                  onChange={(e) => setP2Name(e.target.value)}
                  className="w-full bg-white border-2 border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#1E1B4B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                  placeholder="Player 2 Name"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
                  Choose Avatar Emoji
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["👩‍💻", "👨‍💻", "🧙", "🐱", "🐶", "🚀", "🔥", "🦄", "🎯", "🤖", "🍕", "🧠", "🍀", "👾", "🏆"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setP2Avatar(emoji)}
                      className={`text-lg p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer ${
                        p2Avatar === emoji ? "bg-[#D2D6FF] border-2 border-[#4F46E5]" : "bg-white border-2 border-transparent"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
                  Choose Color Theme
                </label>
                <div className="flex gap-2">
                  {Object.keys(COLOR_MAP).map((colorKey) => {
                    const col = COLOR_MAP[colorKey];
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setP2Color(colorKey)}
                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                          p2Color === colorKey ? "border-[#1E1B4B] ring-2 ring-indigo-200" : "border-transparent"
                        }`}
                        style={{ backgroundColor: col.primary }}
                        title={colorKey}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (p2Name.trim()) {
                    onUpdateUserProfile(user2.id, p2Name.trim(), p2Avatar, p2Color);
                  }
                }}
                className="w-full mt-2 bg-[#4F46E5] hover:bg-[#3B33C3] text-white text-xs font-extrabold py-2 rounded-xl transition-all border-b-2 border-r-2 border-indigo-950 active:border-b-0 active:border-r-0 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                Save Player 2 Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Duel Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current User Card */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${uColor.gradient} rounded-bl-full pointer-events-none`} />
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{currentUser.avatar}</span>
              <div>
                <h2 className="font-extrabold text-lg text-[#1E1B4B]">{currentUser.name}</h2>
                <span className={`${uColor.bg} ${uColor.text} ${uColor.border} border-2 text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase`}>
                  PLAYER 1
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono flex items-center gap-1 justify-end" style={{ color: uColor.primary }}>
                <Trophy size={20} className="text-yellow-400" />
                {currentUser.points}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Lifetime Points
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#EFFDF5] rounded-xl p-3.5 border-2 border-[#D1FAE5] flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-xs">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-800 font-mono">{currentUser.streakCurrent}</div>
                <div className="text-[10px] text-emerald-700 uppercase tracking-wide font-bold">Current Streak</div>
              </div>
            </div>

            <div className={`${uColor.bg} rounded-xl p-3.5 border-2 ${uColor.border} flex items-center gap-3`}>
              <div className="p-2 bg-white rounded-lg shadow-xs" style={{ color: uColor.primary }}>
                <Star size={18} />
              </div>
              <div>
                <div className="text-lg font-bold font-mono" style={{ color: uColor.primary }}>{currentUser.streakLongest}</div>
                <div className="text-[10px] uppercase tracking-wide font-bold" style={{ color: uColor.primary }}>Longest Streak</div>
              </div>
            </div>
          </div>

          {/* Weekly goals for user */}
          <div className="space-y-4">
            <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Target size={14} style={{ color: uColor.primary }} />
                  Weekly Progress ({userWeekLogs.length} solved)
                </span>
                <span className="text-xs text-slate-600 font-bold font-mono">
                  Goal: {userPlan?.questionGoal || 0}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mb-1.5 border border-gray-300">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((userWeekLogs.length) / (userPlan?.questionGoal || 1)) * 100)}%`, backgroundColor: uColor.primary }}
                />
              </div>

              {userPlan?.stretchGoal && (
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold mt-1">
                  <span>Stretch Target Progress:</span>
                  <span className="font-mono">{userWeekLogs.length} / {userPlan.stretchGoal}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t-2 border-slate-200 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold">Weekly Points:</span>
                <span className="font-mono text-emerald-600 font-bold">+{userWeekPoints} pts</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Week's Planned Topics</span>
                {!isPlanning && (
                  <button 
                    onClick={handleStartPlanning}
                    className="font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    style={{ color: uColor.primary }}
                  >
                    <Plus size={12} /> Set Goal
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {userPlan && userPlan.topics.length > 0 ? (
                  userPlan.topics.map((t) => (
                    <span key={t} className={`${uColor.bg} ${uColor.text} ${uColor.border} text-[10px] font-bold px-2 py-0.5 rounded-full border`}>
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No topics planned for this week.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Friend User Card */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${fColor.gradient} rounded-bl-full pointer-events-none`} />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl">{friendUser.avatar}</span>
              <div>
                <h2 className="font-extrabold text-lg text-[#1E1B4B]">{friendUser.name}</h2>
                <span className={`${fColor.bg} ${fColor.text} ${fColor.border} border-2 text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase`}>
                  PLAYER 2
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black font-mono flex items-center gap-1 justify-end" style={{ color: fColor.primary }}>
                <Trophy size={20} className="text-gray-400" />
                {friendUser.points}
              </div>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                Lifetime Points
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#EFFDF5] rounded-xl p-3.5 border-2 border-[#D1FAE5] flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-xs">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-800 font-mono">{friendUser.streakCurrent}</div>
                <div className="text-[10px] text-emerald-700 uppercase tracking-wide font-bold">Current Streak</div>
              </div>
            </div>

            <div className={`${fColor.bg} rounded-xl p-3.5 border-2 ${fColor.border} flex items-center gap-3`}>
              <div className="p-2 bg-white rounded-lg shadow-xs" style={{ color: fColor.primary }}>
                <Star size={18} />
              </div>
              <div>
                <div className="text-lg font-bold font-mono" style={{ color: fColor.primary }}>{friendUser.streakLongest}</div>
                <div className="text-[10px] uppercase tracking-wide font-bold" style={{ color: fColor.primary }}>Longest Streak</div>
              </div>
            </div>
          </div>

          {/* Weekly goals for friend */}
          <div className="space-y-4">
            <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Target size={14} style={{ color: fColor.primary }} />
                  Weekly Progress ({friendWeekLogs.length} solved)
                </span>
                <span className="text-xs text-slate-600 font-bold font-mono">
                  Goal: {friendPlan?.questionGoal || 0}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mb-1.5 border border-gray-300">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((friendWeekLogs.length) / (friendPlan?.questionGoal || 1)) * 100)}%`, backgroundColor: fColor.primary }}
                />
              </div>

              {friendPlan?.stretchGoal && (
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold mt-1">
                  <span>Stretch Target Progress:</span>
                  <span className="font-mono">{friendWeekLogs.length} / {friendPlan.stretchGoal}</span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t-2 border-slate-200 flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold">Weekly Points:</span>
                <span className="font-mono text-emerald-600 font-bold">+{friendWeekPoints} pts</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-xl p-4 border-2 border-[#E2E8F0]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700">Week's Planned Topics</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {friendPlan && friendPlan.topics.length > 0 ? (
                  friendPlan.topics.map((t) => (
                    <span key={t} className={`${fColor.bg} ${fColor.text} ${fColor.border} text-[10px] font-bold px-2 py-0.5 rounded-full border`}>
                      {t}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No topics planned for this week.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Weekly Target & Motivation Meter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-5 shadow-lg">
          <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-3 flex items-center gap-1.5">
            <Target size={16} className="text-emerald-500" />
            Shared Combined Weekly Target
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold mb-2">
            <span>Our combined questions target:</span>
            <span className="font-bold font-mono text-[#1E1B4B]">{sharedActual} / {sharedTarget || 10}</span>
          </div>
          <div className="w-full bg-gray-200 h-3.5 rounded-full overflow-hidden border-2 border-gray-300">
            <div 
              className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (sharedActual / (sharedTarget || 10)) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-2.5 font-medium leading-relaxed">
            Teamwork pays off. Complete your portion of the goal to unlock a <span className="text-emerald-600 font-bold">+10 pts bonus</span> and keep the overall meter climbing!
          </p>
        </div>

        {/* Motivation Meter card */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-500/5 blur-3xl rounded-full pointer-events-none" />
          
          <div>
            <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-2 flex items-center gap-1.5">
              <Star size={16} className="text-yellow-500 animate-spin-slow" />
              Motivation Meter
            </h3>
            <p className="text-sm font-bold text-purple-900 italic leading-relaxed py-1 bg-[#FDF2F8]/80 p-2.5 rounded-xl border border-pink-150">
              "{motivationText}"
            </p>
          </div>
          <div className="mt-3 pt-3 border-t-2 border-slate-200 flex items-center justify-between text-[11px] text-gray-500 font-bold">
            <span>Current Duel Lead:</span>
            <span className="font-bold text-[#1E1B4B]">
              {currentUser.points === friendUser.points 
                ? "Tie Game!" 
                : currentUser.points > friendUser.points 
                  ? `${currentUser.name} (+${currentUser.points - friendUser.points} pts)`
                  : `${friendUser.name} (+${friendUser.points - currentUser.points} pts)`
              }
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Planning Modal Form */}
      {isPlanning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border-b-8 border-r-8 border-[#CBD5E1] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-[#1E1B4B] mb-1">Set Your Weekly Focus & Goals</h3>
            <p className="text-xs text-gray-500 mb-4 font-medium">Choose the DSA topics you plan to practice this week and set your question targets.</p>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select Focus Topics (Multi-select)
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto bg-[#F8FAFC] p-2.5 rounded-lg border-2 border-[#E2E8F0] scrollbar-thin">
                  {DSA_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`text-left text-xs px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#7C3AED] text-white font-bold"
                            : "bg-white text-gray-500 hover:bg-gray-100 hover:text-[#1E293B] border border-gray-200"
                        }`}
                      >
                        {topic}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Minimum Question Goal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={goalQuestions}
                    onChange={(e) => setGoalQuestions(Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Optional Stretch Goal
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    placeholder="e.g. 10"
                    value={stretchGoalQuestions}
                    onChange={(e) => setStretchGoalQuestions(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t-2 border-[#E2E8F0] justify-end">
                <button
                  type="button"
                  onClick={() => setIsPlanning(false)}
                  className="bg-transparent hover:bg-gray-100 text-gray-500 text-xs px-4 py-2 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs px-4 py-2 rounded-lg font-extrabold border-b-2 border-r-2 border-purple-950 active:border-b-0 active:border-r-0 shadow-md shadow-purple-100 cursor-pointer"
                >
                  Apply Weekly Goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Coding Challenge panel */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#FFFDF2] rounded-xl text-amber-500 border-2 border-[#FEF08A] mt-1 shadow-sm animate-bounce">
            <Trophy size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#FEF08A] text-amber-800 border-2 border-amber-300 font-extrabold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                DAILY CHALLENGE
              </span>
              <span className="text-[10px] text-gray-500 font-bold">Bonus: +10 Points</span>
            </div>
            <h4 className="font-extrabold text-[#1E1B4B] text-base mt-1.5 flex items-center gap-1.5">
              {challenge.name}
              <span className="text-xs font-normal text-gray-500 font-semibold">({challenge.topic})</span>
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 font-medium">
              <span className="flex items-center gap-1 font-bold">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  challenge.difficulty === "Easy" ? "bg-emerald-500" : challenge.difficulty === "Medium" ? "bg-amber-500" : "bg-red-500"
                }`} />
                {challenge.difficulty}
              </span>
              <span>•</span>
              <span>Available until midnight</span>
            </div>
          </div>
        </div>

        <div>
          {challengeCompleted ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-[#EFFDF5] border-2 border-emerald-300 px-4 py-2 rounded-xl text-sm font-bold">
              <CheckCircle2 size={16} />
              Challenge Solved!
            </div>
          ) : (
            <button
              onClick={() => onLogDailyChallenge(challenge)}
              className="w-full md:w-auto bg-amber-400 hover:bg-amber-500 text-amber-950 font-extrabold text-xs px-5 py-2.5 rounded-xl border-b-4 border-r-4 border-amber-600 active:border-b-0 active:border-r-0 transition-all shadow-md shadow-yellow-100 cursor-pointer"
            >
              Mark Completed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
