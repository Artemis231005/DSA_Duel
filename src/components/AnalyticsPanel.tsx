/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from "recharts";
import { UserProfile, QuestionLog, DSATopic } from "../types";
import { calculateTopicProgress, getTopicInsights, DSA_TOPICS } from "../lib/dsaUtils";
import { Trophy, Award, TrendingUp, Users, PieChart as PieIcon } from "lucide-react";

interface AnalyticsPanelProps {
  users: UserProfile[];
  questions: QuestionLog[];
}

export default function AnalyticsPanel({ users, questions }: AnalyticsPanelProps) {
  const user1 = users[0] || { id: "user_1", name: "Ishita", points: 0, streakCurrent: 0, streakLongest: 0 };
  const user2 = users[1] || { id: "user_2", name: "Neha", points: 0, streakCurrent: 0, streakLongest: 0 };

  // Calculate difficulty count per user
  const getDifficultyData = (userId: string) => {
    const userLogs = questions.filter((q) => q.userId === userId);
    const easy = userLogs.filter((q) => q.difficulty === "Easy").length;
    const medium = userLogs.filter((q) => q.difficulty === "Medium").length;
    const hard = userLogs.filter((q) => q.difficulty === "Hard").length;
    const total = userLogs.length || 1;

    return [
      { name: "Easy", count: easy, percentage: Math.round((easy / total) * 100) },
      { name: "Medium", count: medium, percentage: Math.round((medium / total) * 100) },
      { name: "Hard", count: hard, percentage: Math.round((hard / total) * 100) },
    ];
  };

  const u1Diff = getDifficultyData(user1.id);
  const u2Diff = getDifficultyData(user2.id);

  // Group solved count by topic
  const getTopicChartData = () => {
    return DSA_TOPICS.map((topic) => {
      const u1Count = questions.filter((q) => q.userId === user1.id && q.topic === topic).length;
      const u2Count = questions.filter((q) => q.userId === user2.id && q.topic === topic).length;
      return {
        topic: topic.length > 12 ? topic.substring(0, 12) + "..." : topic,
        fullTopic: topic,
        [user1.name]: u1Count,
        [user2.name]: u2Count,
      } as Record<string, any>;
    }).filter((item: any) => item[user1.name] > 0 || item[user2.name] > 0);
  };

  const topicChartData = getTopicChartData();

  // Platform usage data
  const getPlatformChartData = (userId: string) => {
    const userLogs = questions.filter((q) => q.userId === userId);
    const platforms = ["LeetCode", "GeeksforGeeks", "VS Code", "CodeStudio", "Other"];
    return platforms.map((p) => {
      const count = userLogs.filter((q) => q.platform === p).length;
      return { name: p, value: count };
    }).filter((item) => item.value > 0);
  };

  const u1Plats = getPlatformChartData(user1.id);
  const COLORS = ["#8b5cf6", "#6366f1", "#10b981", "#f59e0b", "#ef4444"];

  // Head-to-Head calculations
  const u1Insights = getTopicInsights(user1.id, questions);
  const u2Insights = getTopicInsights(user2.id, questions);

  const u1TotalQuestions = questions.filter((q) => q.userId === user1.id).length;
  const u2TotalQuestions = questions.filter((q) => q.userId === user2.id).length;

  // Platform Distribution values
  const getPlatformCount = (userId: string) => {
    const logs = questions.filter((q) => q.userId === userId);
    const plats = Array.from(new Set(logs.map((q) => q.platform)));
    return plats.length;
  };

  return (
    <div className="space-y-6">
      {/* Overview Head-to-Head Battle Cards */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-extrabold text-[#1E1B4B] flex items-center gap-2 mb-4">
          <Users size={20} className="text-[#7C3AED]" />
          Head-to-Head Duel Stats
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-gray-700">
            <thead className="text-[10px] uppercase text-gray-500 font-extrabold bg-[#F8FAFC] border-b-2 border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Metric</th>
                <th className="py-3 px-4 text-[#7C3AED] text-right">{user1.name}</th>
                <th className="py-3 px-4 text-center text-gray-500">Battlefield</th>
                <th className="py-3 px-4 text-indigo-600 text-left">{user2.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#E2E8F0] font-semibold text-gray-700">
              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Lifetime Points</td>
                <td className="py-3 px-4 text-right font-black text-[#7C3AED] font-mono text-sm">{user1.points}</td>
                <td className="py-3 px-4 text-center">
                  <span className="bg-[#FEF08A] text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-300">
                    {user1.points > user2.points ? `${user1.name} leads` : user2.points > user1.points ? `${user2.name} leads` : "Tie!"}
                  </span>
                </td>
                <td className="py-3 px-4 text-left font-black text-indigo-600 font-mono text-sm">{user2.points}</td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Solved Questions</td>
                <td className="py-3 px-4 text-right font-mono">{u1TotalQuestions}</td>
                <td className="py-3 px-4 text-center text-gray-500">Total Volume</td>
                <td className="py-3 px-4 text-left font-mono">{u2TotalQuestions}</td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Active Streak</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-600 font-black">{user1.streakCurrent} days</td>
                <td className="py-3 px-4 text-center text-gray-500">Consistency</td>
                <td className="py-3 px-4 text-left font-mono text-emerald-600 font-black">{user2.streakCurrent} days</td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Longest Streak Record</td>
                <td className="py-3 px-4 text-right font-mono text-amber-600 font-black">{user1.streakLongest} days</td>
                <td className="py-3 px-4 text-center text-gray-500">Peak Endurance</td>
                <td className="py-3 px-4 text-left font-mono text-amber-600 font-black">{user2.streakLongest} days</td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Strongest Topic</td>
                <td className="py-3 px-4 text-right text-[#7C3AED] font-extrabold">{u1Insights.strongest}</td>
                <td className="py-3 px-4 text-center text-gray-500">Specialty</td>
                <td className="py-3 px-4 text-left text-indigo-600 font-extrabold">{u2Insights.strongest}</td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Neglected DSA Concepts</td>
                <td className="py-3 px-4 text-right text-gray-500 max-w-[120px] truncate" title={u1Insights.neglected}>{u1Insights.neglected}</td>
                <td className="py-3 px-4 text-center text-gray-500">Gaps to Cover</td>
                <td className="py-3 px-4 text-left text-gray-500 max-w-[120px] truncate" title={u2Insights.neglected}>{u2Insights.neglected}</td>
              </tr>

              <tr>
                <td className="py-3 px-4 text-[#1E1B4B] font-extrabold">Platforms Visited</td>
                <td className="py-3 px-4 text-right font-mono">{getPlatformCount(user1.id)}</td>
                <td className="py-3 px-4 text-center text-gray-500">Multi-platform</td>
                <td className="py-3 px-4 text-left font-mono">{getPlatformCount(user2.id)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Points & Difficulty Analysis charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic points comparison chart */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl">
          <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-[#7C3AED]" />
            Core points Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Lifetime Points", [user1.name]: user1.points, [user2.name]: user2.points },
                  { name: "Questions Count", [user1.name]: u1TotalQuestions * 5, [user2.name]: u2TotalQuestions * 5 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #E2E8F0", borderRadius: 12, color: "#1E1B4B", fontWeight: "bold" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
                <Bar dataKey={user1.name} fill="#7C3AED" radius={[4, 4, 0, 0]} />
                <Bar dataKey={user2.name} fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution Comparison */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl">
          <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-4 flex items-center gap-1.5">
            <PieIcon size={16} className="text-emerald-500 animate-pulse" />
            Difficulty Mix (Easy / Medium / Hard)
          </h3>

          <div className="grid grid-cols-2 gap-4 h-64">
            {/* User 1 Pie */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold text-[#1E1B4B] mb-2">{user1.name}</span>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={u1Diff}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {u1Diff.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : index === 1 ? "#F59E0B" : "#EF4444"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #E2E8F0", fontSize: 11, borderRadius: 8, color: "#1E1B4B" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 text-[10px] mt-1 font-mono font-bold">
                <span className="text-emerald-600">E:{u1Diff[0].count}</span>
                <span className="text-amber-600">M:{u1Diff[1].count}</span>
                <span className="text-red-600">H:{u1Diff[2].count}</span>
              </div>
            </div>

            {/* User 2 Pie */}
            <div className="flex flex-col items-center justify-center">
              <span className="text-xs font-extrabold text-[#1E1B4B] mb-2">{user2.name}</span>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={u2Diff}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {u2Diff.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#10B981" : index === 1 ? "#F59E0B" : "#EF4444"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #E2E8F0", fontSize: 11, borderRadius: 8, color: "#1E1B4B" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-2 text-[10px] mt-1 font-mono font-bold">
                <span className="text-emerald-600">E:{u2Diff[0].count}</span>
                <span className="text-amber-600">M:{u2Diff[1].count}</span>
                <span className="text-red-600">H:{u2Diff[2].count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic practice frequency chart */}
      {topicChartData.length > 0 && (
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl">
          <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-4 flex items-center gap-1.5">
            <Award size={16} className="text-[#7C3AED]" />
            Solved Questions by DSA Topic
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topicChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <XAxis dataKey="topic" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "2px solid #E2E8F0", borderRadius: 12, color: "#1E1B4B", fontWeight: "bold" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: "bold" }} />
                <Bar dataKey={user1.name} fill="#7C3AED" radius={[2, 2, 0, 0]} />
                <Bar dataKey={user2.name} fill="#4F46E5" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Topic progress / Mastery percentages breakdown */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl">
        <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-4">Topic Mastery Breakdown</h3>
        <p className="text-xs text-gray-500 font-semibold mb-5">Each topic baseline is 10 solved questions to achieve 100% mastery.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {DSA_TOPICS.map((topic) => {
            const u1Count = questions.filter((q) => q.userId === user1.id && q.topic === topic).length;
            const u2Count = questions.filter((q) => q.userId === user2.id && q.topic === topic).length;
            
            const u1Mastery = Math.min(100, Math.round((u1Count / 10) * 100));
            const u2Mastery = Math.min(100, Math.round((u2Count / 10) * 100));

            return (
              <div key={topic} className="space-y-1.5 pb-2 border-b-2 border-[#E2E8F0]">
                <div className="flex justify-between text-xs">
                  <span className="font-extrabold text-[#1E1B4B]">{topic}</span>
                  <div className="flex gap-4 font-mono text-[10px] font-bold">
                    <span className="text-[#7C3AED]">{user1.name}: {u1Count} ({u1Mastery}%)</span>
                    <span className="text-indigo-600">{user2.name}: {u2Count} ({u2Mastery}%)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F1F5F9] h-3 rounded-full overflow-hidden border-2 border-[#E2E8F0] flex">
                    <div 
                      className="bg-[#7C3AED] h-full transition-all duration-500" 
                      style={{ width: `${u1Mastery / 2}%` }}
                    />
                    <div 
                      className="bg-[#4F46E5] h-full transition-all duration-500" 
                      style={{ width: `${u2Mastery / 2}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
