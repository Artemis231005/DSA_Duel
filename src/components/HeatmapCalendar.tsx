/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calendar, HelpCircle, Code, ExternalLink, Flame } from "lucide-react";
import { QuestionLog } from "../types";

interface HeatmapCalendarProps {
  questions: QuestionLog[];
  userNames: Record<string, string>;
}

export default function HeatmapCalendar({ questions, userNames }: HeatmapCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Helper to generate the past 12 weeks of days for the GitHub heatmap (84 cells)
  const getHeatmapDays = () => {
    const days: string[] = [];
    const now = new Date();
    // Start 12 weeks ago, aligned to Sunday
    const startOffset = now.getDay();
    const totalDays = 12 * 7;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i - startOffset);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  };

  const heatmapDays = getHeatmapDays();

  // Helper to get number of questions solved on a given date by any user
  const getCountForDate = (dateStr: string) => {
    return questions.filter((q) => q.date === dateStr).length;
  };

  const getHeatColorClass = (count: number) => {
    if (count === 0) return "bg-gray-100 border-gray-200";
    if (count === 1) return "bg-emerald-100 border-emerald-200 text-emerald-800";
    if (count === 2) return "bg-emerald-200 border-emerald-300 text-emerald-900";
    if (count === 3) return "bg-[#6EE7B7] border-[#34D399] text-emerald-950";
    return "bg-[#059669] border-[#047857] text-white font-bold";
  };

  // Monthly Calendar logic
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // align Monday
    const totalDays = lastDay.getDate();

    const days: { dateStr: string | null; dayNum: number | null }[] = [];

    // Prepad empty cells
    for (let i = 0; i < startOffset; i++) {
      days.push({ dateStr: null, dayNum: null });
    }

    // Days of month
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        dateStr: d.toISOString().split("T")[0],
        dayNum: i,
      });
    }

    return days;
  };

  const monthDays = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Solved logs for currently selected date
  const selectedDateLogs = questions.filter((q) => q.date === selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Heatmap & Calendar column */}
      <div className="lg:col-span-2 space-y-6">
        {/* GitHub-style Contribution Heatmap */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-sm text-[#1E1B4B] flex items-center gap-1.5">
              <Flame size={16} className="text-emerald-500 animate-pulse" />
              Activity Heatmap (Past 12 Weeks)
            </h3>
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider font-mono bg-gray-100 px-2 py-0.5 rounded">Synced</span>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border-2 border-[#E2E8F0] overflow-x-auto scrollbar-thin">
            <div className="flex gap-1 min-w-[340px]">
              {/* Day Labels */}
              <div className="grid grid-rows-7 gap-1 text-[8px] text-gray-400 font-extrabold pr-1.5 justify-items-end select-none uppercase">
                <span>Mon</span>
                <span className="invisible">Tue</span>
                <span>Wed</span>
                <span className="invisible">Thu</span>
                <span>Fri</span>
                <span className="invisible">Sat</span>
                <span>Sun</span>
              </div>

              {/* Grid Column wrapper */}
              <div className="grid grid-flow-col grid-rows-7 gap-1 flex-1">
                {heatmapDays.map((dateStr) => {
                  const count = getCountForDate(dateStr);
                  const isSelected = selectedDate === dateStr;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`w-3 h-3 rounded-xs border-2 transition-all cursor-pointer ${getHeatColorClass(count)} ${
                        isSelected ? "ring-2 ring-[#7C3AED] scale-110" : ""
                      }`}
                      title={`${dateStr}: ${count} questions solved`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 text-[10px] text-gray-500 mt-3 font-mono font-bold">
              <span>Less</span>
              <span className="w-2.5 h-2.5 bg-gray-100 rounded-xs border-2 border-gray-200" />
              <span className="w-2.5 h-2.5 bg-emerald-100 rounded-xs border-2 border-emerald-200" />
              <span className="w-2.5 h-2.5 bg-emerald-200 rounded-xs border-2 border-emerald-300" />
              <span className="w-2.5 h-2.5 bg-[#6EE7B7] rounded-xs border-2 border-[#34D399]" />
              <span className="w-2.5 h-2.5 bg-[#059669] rounded-xs border-2 border-[#047857]" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Monthly Calendar View */}
        <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-sm text-[#1E1B4B] flex items-center gap-1.5">
              <Calendar size={16} className="text-[#7C3AED]" />
              Calendar View
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="text-xs bg-white hover:bg-gray-100 font-bold px-3 py-1 border-2 border-[#E2E8F0] rounded-xl cursor-pointer text-gray-600 transition-all shadow-xs"
              >
                Prev
              </button>
              <span className="text-xs font-black font-mono text-[#1E1B4B] px-2">{monthName}</span>
              <button
                onClick={handleNextMonth}
                className="text-xs bg-white hover:bg-gray-100 font-bold px-3 py-1 border-2 border-[#E2E8F0] rounded-xl cursor-pointer text-gray-600 transition-all shadow-xs"
              >
                Next
              </button>
            </div>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-xl border-2 border-[#E2E8F0]">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((cell, idx) => {
                if (!cell.dateStr) {
                  return <div key={`empty-${idx}`} className="h-9" />;
                }

                const count = getCountForDate(cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;
                const isToday = cell.dateStr === new Date().toISOString().split("T")[0];

                return (
                  <button
                    key={cell.dateStr}
                    onClick={() => setSelectedDate(cell.dateStr!)}
                    className={`h-9 rounded-lg flex flex-col justify-between p-1.5 text-left relative transition-all border-2 cursor-pointer ${
                      isSelected
                        ? "bg-[#7C3AED] border-[#7C3AED] text-white scale-102 font-bold shadow-md shadow-violet-600/15"
                        : count > 0
                        ? "bg-[#EFFDF5] border-emerald-300 text-emerald-800 font-bold"
                        : "bg-white border-[#E2E8F0] text-gray-600 hover:border-gray-300 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-bold font-mono ${isToday && !isSelected ? "text-[#7C3AED] underline font-black" : ""}`}>
                        {cell.dayNum}
                      </span>
                      {count > 0 && (
                        <span className={`text-[8px] font-black px-1 rounded font-mono ${
                          isSelected ? "bg-white text-[#7C3AED]" : "bg-emerald-200 text-emerald-800"
                        }`}>
                          {count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day details column */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-sm text-[#1E1B4B] mb-3 flex items-center gap-1.5">
            <Code size={16} className="text-[#7C3AED]" />
            Activity on {selectedDate}
          </h3>

          <p className="text-xs text-gray-500 font-semibold mb-4">
            Showing question submissions logged on this calendar date.
          </p>

          {selectedDateLogs.length === 0 ? (
            <div className="text-center py-10 bg-[#F8FAFC] rounded-xl border-2 border-dashed border-[#E2E8F0] p-4">
              <p className="text-xs text-gray-400 italic font-bold leading-relaxed">No questions solved on this date. Select a shaded cell on the heatmap or calendar to inspect!</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {selectedDateLogs.map((q) => (
                <div key={q.id} className="bg-white border-2 border-[#E2E8F0] rounded-xl p-3 space-y-1.5 hover:border-[#7C3AED] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold font-mono bg-[#F5F3FF] text-[#7C3AED] px-1.5 py-0.5 rounded border-2 border-[#E0D8FF]">
                      {userNames[q.userId] || "Unknown User"}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${
                      q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-xs text-[#1E1B4B] leading-snug">{q.name}</h4>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold">
                    <span>{q.topic}</span>
                    <span className="text-emerald-600 font-black font-mono">+{q.points} pts</span>
                  </div>

                  {q.note && (
                    <p className="text-[10px] text-gray-700 italic leading-normal border-l-4 border-[#7C3AED] pl-2 mt-1 font-semibold">
                      "{q.note}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t-2 border-[#E2E8F0] pt-4 mt-4">
          <div className="bg-amber-50 p-3.5 rounded-xl border-2 border-[#FEF08A] text-[11px] text-amber-900 leading-relaxed font-semibold">
            <span className="font-extrabold text-amber-950 block mb-1">Consistency Tip:</span> Consecutive active days multiply points on the leaderboard via Streak Bonuses (+15 points per block of 7 days). Keep your daily grid green!
          </div>
        </div>
      </div>
    </div>
  );
}
