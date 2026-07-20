/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Trophy, Award, Crown, Calendar, Sparkles } from "lucide-react";
import { UserProfile, QuestionLog } from "../types";

interface LeaderboardsProps {
  users: UserProfile[];
  questions: QuestionLog[];
}

export default function Leaderboards({ users, questions }: LeaderboardsProps) {
  const user1 = users[0] || { id: "user_1", name: "Ishita", points: 0, avatar: "👩‍💻", color: "purple", streakCurrent: 0, streakLongest: 0 };
  const user2 = users[1] || { id: "user_2", name: "Neha", points: 0, avatar: "👨‍💻", color: "indigo", streakCurrent: 0, streakLongest: 0 };

  // Calculate points this week (from Monday 00:00:00 to Sunday 23:59:59)
  const getWeeklyPoints = (userId: string) => {
    const now = new Date();
    const currentDay = now.getDay();
    const distance = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distance);
    monday.setHours(0, 0, 0, 0);

    return questions
      .filter((q) => q.userId === userId && new Date(q.date) >= monday)
      .reduce((sum, q) => sum + q.points, 0);
  };

  const u1WeeklyPoints = getWeeklyPoints(user1.id);
  const u2WeeklyPoints = getWeeklyPoints(user2.id);

  // Past weeks history of winners (starts empty for a clean competitive experience)
  const winnersHistory: Array<{ weekId: string; winner: string; points: number; opponentPoints: number }> = [];

  // Calculate total historical wins
  const totalWins = {
    user_1: 0,
    user_2: 0,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Weekly Leaderboard */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/5 to-transparent pointer-events-none" />
        
        <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-5 flex items-center gap-1.5">
          <Trophy size={16} className="text-yellow-500 animate-bounce" />
          Weekly Leaderboard
        </h3>

        <div className="space-y-4">
          {/* User 1 */}
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
            u1WeeklyPoints >= u2WeeklyPoints 
              ? "bg-[#F5F3FF] border-[#C7D2FE]" 
              : "bg-[#F8FAFC] border-[#E2E8F0]"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user1.avatar}</span>
              <div>
                <h4 className="font-extrabold text-xs text-[#1E1B4B] flex items-center gap-1">
                  {user1.name}
                  {u1WeeklyPoints >= u2WeeklyPoints && <Crown size={12} className="text-yellow-500" />}
                </h4>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Week's practice</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-[#7C3AED] font-mono">+{u1WeeklyPoints}</span>
              <span className="text-[9px] text-gray-400 font-bold block">PTS</span>
            </div>
          </div>

          {/* User 2 */}
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
            u2WeeklyPoints >= u1WeeklyPoints 
              ? "bg-[#EEF2FF] border-[#D2D6FF]" 
              : "bg-[#F8FAFC] border-[#E2E8F0]"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user2.avatar}</span>
              <div>
                <h4 className="font-extrabold text-xs text-[#1E1B4B] flex items-center gap-1">
                  {user2.name}
                  {u2WeeklyPoints >= u1WeeklyPoints && <Crown size={12} className="text-yellow-500" />}
                </h4>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Week's practice</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-indigo-600 font-mono">+{u2WeeklyPoints}</span>
              <span className="text-[9px] text-gray-400 font-bold block">PTS</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 font-medium mt-4 leading-relaxed italic text-center">
          Resetting weekly on Sunday at midnight UTC. Earn points by logging questions!
        </p>
      </div>

      {/* Overall Lifetime Leaderboard */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none" />

        <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-5 flex items-center gap-1.5">
          <Crown size={16} className="text-yellow-500" />
          Lifetime Leaderboard
        </h3>

        <div className="space-y-4">
          {/* User 1 Overall */}
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
            user1.points >= user2.points 
              ? "bg-[#F5F3FF] border-[#C7D2FE]" 
              : "bg-[#F8FAFC] border-[#E2E8F0]"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2.5xl">{user1.avatar}</span>
              <div>
                <h4 className="font-extrabold text-xs text-[#1E1B4B] flex items-center gap-1">
                  {user1.name}
                  {user1.points >= user2.points && <Crown size={12} className="text-yellow-500" />}
                </h4>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">All-time practice</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-[#7C3AED] font-mono">{user1.points}</span>
              <span className="text-[9px] text-gray-400 font-bold block">PTS</span>
            </div>
          </div>

          {/* User 2 Overall */}
          <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
            user2.points >= user1.points 
              ? "bg-[#EEF2FF] border-[#D2D6FF]" 
              : "bg-[#F8FAFC] border-[#E2E8F0]"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2.5xl">{user2.avatar}</span>
              <div>
                <h4 className="font-extrabold text-xs text-[#1E1B4B] flex items-center gap-1">
                  {user2.name}
                  {user2.points >= user1.points && <Crown size={12} className="text-yellow-500" />}
                </h4>
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">All-time practice</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-indigo-600 font-mono">{user2.points}</span>
              <span className="text-[9px] text-gray-400 font-bold block">PTS</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-[#E2E8F0] flex justify-between items-center text-[10px] text-gray-500 font-bold">
          <span>Overall Champion Title:</span>
          <span className="font-extrabold text-yellow-600 flex items-center gap-1">
            <Sparkles size={10} />
            {user1.points > user2.points ? user1.name : user2.points > user1.points ? user2.name : "Equal Power!"}
          </span>
        </div>
      </div>

      {/* Weekly Winners History & Wins Total */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-4 flex items-center gap-1.5">
            <Award size={16} className="text-emerald-500" />
            Weekly Winners Log
          </h3>

          <div className="bg-[#F8FAFC] rounded-xl p-3 border-2 border-[#E2E8F0] flex justify-around text-center mb-4">
            <div>
              <span className="text-xs font-bold text-gray-500">{user1.name} Wins</span>
              <span className="text-lg font-black text-[#7C3AED] block font-mono">{totalWins.user_1}</span>
            </div>
            <div className="w-[2px] bg-[#E2E8F0]" />
            <div>
              <span className="text-xs font-bold text-gray-500">{user2.name} Wins</span>
              <span className="text-lg font-black text-indigo-600 block font-mono">{totalWins.user_2}</span>
            </div>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
            {winnersHistory.map((item) => (
              <div key={item.weekId} className="bg-[#F8FAFC] p-2 rounded-lg border-2 border-[#E2E8F0] flex items-center justify-between text-[11px] font-bold">
                <span className="font-mono text-gray-500 flex items-center gap-1">
                  <Calendar size={10} /> {item.weekId}
                </span>
                <span className="text-[#1E293B]">
                  Winner: <strong className="text-emerald-600 font-extrabold">{item.winner}</strong> ({item.points} vs {item.opponentPoints})
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-gray-500 font-medium mt-4 leading-relaxed">
          Weekly victories count towards the Year-End Grand Championship, keeping the duel competitive week-after-week!
        </p>
      </div>
    </div>
  );
}
