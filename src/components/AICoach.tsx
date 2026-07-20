/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, BrainCircuit, MessageSquare, Send, RefreshCw, AlertCircle, TrendingUp, Compass, Flame, HelpCircle
} from "lucide-react";
import { UserProfile, AIInsights } from "../types";

interface AICoachProps {
  currentUser: UserProfile;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export default function AICoach({ currentUser }: AICoachProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Hello ${currentUser.name}! I am your DSA Duel Coach. I have indexed your complete practice log. Ask me anything like "What is my weakest topic?", "Compare this month with last month" or "What should I practice next?".`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sendingQuery, setSendingQuery] = useState(false);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    setLoadingInsights(true);
    setError("");
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (!res.ok) throw new Error("Failed to compile insights");
      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate AI insights. Using rule-based backup statistics.");
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [currentUser.id]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || sendingQuery) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setSendingQuery(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, message: textToSend }),
      });
      if (!res.ok) throw new Error("Chat assistant failed to respond");
      const data = await res.json();

      const aiMsg: ChatMessage = {
        sender: "ai",
        text: data.response,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        sender: "ai",
        text: "I am having trouble talking to my servers right now. Please ensure your GEMINI_API_KEY is active or verify your internet connection.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSendingQuery(false);
    }
  };

  const quickQueries = [
    "What is my weakest topic?",
    "Compare my progress with my friend.",
    "What topic should I practice next?",
    "Show my streak performance summary.",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Weekly insights and projections */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/5 to-transparent blur-xl pointer-events-none" />

          <div className="flex justify-between items-center mb-5">
            <h3 className="font-extrabold text-sm text-[#1E1B4B] flex items-center gap-1.5">
              <BrainCircuit size={18} className="text-[#7C3AED]" />
              AI Performance Insights
            </h3>
            <button
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="text-[10px] text-[#7C3AED] hover:text-[#6D28D9] font-black flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={10} className={loadingInsights ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {loadingInsights ? (
            <div className="text-center py-16 space-y-3">
              <RefreshCw className="animate-spin text-[#7C3AED] mx-auto" size={24} />
              <p className="text-xs text-gray-500 font-bold animate-pulse">Analyzing logs & calculating probabilities...</p>
            </div>
          ) : insights ? (
            <div className="space-y-5">
              {/* Summary */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border-2 border-[#E2E8F0]">
                <p className="text-xs text-[#1E1B4B] leading-relaxed font-bold">
                  "{insights.weeklySummary}"
                </p>
              </div>

              {/* Stats Projections list */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border-2 border-[#E2E8F0]">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide font-extrabold">Goal Completion</span>
                  <div className="text-lg font-black text-emerald-600 font-mono mt-1">
                    {insights.goalCompletionProbability}%
                  </div>
                  <span className="text-[9px] text-gray-400 block font-semibold">Probability estimate</span>
                </div>

                <div className="bg-white rounded-xl p-3 border-2 border-[#E2E8F0]">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide font-extrabold">Year-End projection</span>
                  <div className="text-lg font-black text-[#7C3AED] font-mono mt-1">
                    {insights.projectedEndOfYearTotal}
                  </div>
                  <span className="text-[9px] text-gray-400 block font-semibold">Estimated total questions</span>
                </div>
              </div>

              {/* burnout check & next topic */}
              <div className="space-y-3.5">
                <div className="bg-orange-50 p-3.5 rounded-xl border-2 border-orange-100 text-xs">
                  <span className="font-extrabold text-orange-900 block mb-1 flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    Burnout Detection Index:
                  </span>
                  <p className="text-orange-800 leading-normal font-semibold">{insights.burnoutDetection}</p>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border-2 border-[#E2E8F0] text-xs">
                  <span className="font-extrabold text-[#1E1B4B] block mb-1">Recommended Next Topic Focus:</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {insights.recommendedTopics?.map((t) => (
                      <span key={t} className="bg-[#F5F3FF] text-[#7C3AED] font-extrabold px-2 py-0.5 rounded text-[10px] border-2 border-[#E0D8FF]">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 font-mono font-bold">Suggested minimum goal next week: {insights.recommendedGoal} questions</p>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-xl border-2 border-[#E2E8F0] text-xs">
                  <span className="font-extrabold text-[#1E1B4B] block mb-1 flex items-center gap-1">
                    <Compass size={12} className="text-[#7C3AED]" />
                    Personalized Strategy Tip:
                  </span>
                  <p className="text-gray-600 leading-relaxed font-sans font-semibold">{insights.personalizedStrategy}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-gray-400 italic font-bold">No insights available right now.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chatbot console */}
      <div className="lg:col-span-7 bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-5 shadow-xl flex flex-col h-[520px] justify-between">
        {/* Header */}
        <div className="border-b-2 border-[#E2E8F0] pb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[#7C3AED]" />
            <h3 className="font-extrabold text-sm text-[#1E1B4B]">Interactive Coach Console</h3>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Coach Online" />
        </div>

        {/* Chat window bubble list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 px-1 scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                m.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed font-semibold ${
                  m.sender === "user"
                    ? "bg-[#7C3AED] text-white rounded-tr-none shadow-md"
                    : "bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E1B4B] rounded-tl-none shadow-xs"
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-gray-400 mt-1 font-mono font-bold px-1">
                {m.time}
              </span>
            </div>
          ))}
          {sendingQuery && (
            <div className="flex flex-col items-start mr-auto max-w-[85%]">
              <div className="bg-white border-2 border-[#E2E8F0] p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-gray-500 font-bold shadow-xs">
                <Sparkles className="animate-spin text-[#7C3AED]" size={12} />
                <span>Coach is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries bar */}
        <div className="border-t-2 border-[#E2E8F0] pt-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {quickQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={sendingQuery}
                className="text-[10px] text-gray-500 font-extrabold hover:text-[#7C3AED] bg-white hover:bg-[#F5F3FF] border-2 border-[#E2E8F0] rounded-xl px-2.5 py-1.5 cursor-pointer transition-all disabled:opacity-50 shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Form input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder={`Ask coach about your DSA performance logs...`}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E1B4B] font-bold rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
              disabled={sendingQuery}
            />
            <button
              type="submit"
              disabled={sendingQuery || !inputValue.trim()}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-2.5 rounded-xl shadow-md cursor-pointer disabled:opacity-40 transition-all border-b-4 border-r-4 border-[#5B21B6] flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
