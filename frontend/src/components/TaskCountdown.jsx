import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * TaskCountdown
 * Priority: dueDate (end-of-day) → createdAt + estimatedHours fallback.
 * Falls back gracefully when data is missing.
 */
const TaskCountdown = ({
  createdAt,
  dueDate,
  estimatedHours = 0,
  completedHours = 0,
  status,
  showProgress = true,
}) => {
  const [taskState, setTaskState] = useState(null);

  useEffect(() => {
    // DONE — no countdown needed
    if (status === "DONE") {
      setTaskState({ status: "DONE", text: "Task Completed" });
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      
      if (!dueDate) {
        setTaskState(null);
        return;
      }

      // Robust parsing in case of Java array format, but usually it'll be ISO string
      let dueStr = dueDate;
      if (Array.isArray(dueDate)) {
        const dObj = new Date(Date.UTC(dueDate[0], dueDate[1] - 1, dueDate[2], dueDate[3] || 0, dueDate[4] || 0, dueDate[5] || 0));
        dueStr = dObj.toISOString();
      } else if (typeof dueDate === 'string' && dueDate.includes("T") && !dueDate.endsWith("Z") && !dueDate.includes("+") && !dueDate.includes("-", 10)) {
        dueStr += "Z";
      }

      const due = new Date(dueStr).getTime();
      const diff = due - now;

      // Add console logs for debugging
      console.log("NOW:", new Date());
      console.log("DUE:", new Date(dueStr));
      console.log("DIFF:", diff);

      if (isNaN(due)) {
        setTaskState(null);
        return;
      }

      // Parse createdAt for progress bar calculation
      let startMs = now - (estimatedHours * 3600000); // default to elapsed time based on estimate
      if (createdAt) {
        let startStr = createdAt;
        if (Array.isArray(createdAt)) {
          startMs = Date.UTC(createdAt[0], createdAt[1] - 1, createdAt[2], createdAt[3] || 0, createdAt[4] || 0, createdAt[5] || 0);
        } else {
          if (typeof startStr === 'string' && startStr.includes("T") && !startStr.endsWith("Z") && !startStr.includes("+") && !startStr.includes("-", 10)) {
            startStr += "Z";
          }
          startMs = new Date(startStr).getTime();
        }
      }

      const totalDurationMs = due - startMs;
      const elapsed = now - startMs;
      
      const timeProgress = totalDurationMs > 0
        ? Math.max(0, Math.min(100, (elapsed / totalDurationMs) * 100))
        : 0;

      if (diff <= 0) {
        setTaskState({ status: "OVERDUE", text: "Time Overdue", progress: 100 });
      } else {
        const remainingHours = diff / (1000 * 60 * 60);
        const days = Math.floor(remainingHours / 24);
        const hours = Math.floor(remainingHours % 24);
        const minutes = Math.floor((remainingHours % 1) * 60);

        let text;
        if (days > 0) {
          text = `${days}d ${hours}h Left`;
        } else if (hours > 0) {
          text = `${hours}h ${minutes}m Left`;
        } else {
          text = `${minutes}m Left`;
        }

        setTaskState({ status: "ACTIVE", text, progress: timeProgress });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [createdAt, dueDate, estimatedHours, status]);

  if (!taskState) return null;

  const progress = taskState.progress || 0;

  // --- DONE ---
  if (taskState.status === "DONE") {
    return (
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400 font-bold text-xs">
          <CheckCircle size={13} />
          Task Completed
        </div>
        <span className="px-2 py-0.5 rounded bg-green-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
          DONE
        </span>
      </div>
    );
  }

  // --- OVERDUE (time expired) ---
  if (taskState.status === "OVERDUE") {
    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
            <AlertTriangle size={13} />
            Time Overdue
          </div>
          <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-wider">
            OVERDUE
          </span>
        </div>
        {showProgress && (
          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
            <div className="bg-red-500 h-1.5 rounded w-full" />
          </div>
        )}
      </div>
    );
  }

  // --- ACTIVE ---
  const barColor = progress >= 80
    ? "bg-red-500"
    : progress >= 50
      ? "bg-orange-400"
      : "bg-green-400";

  const textColor = progress >= 80
    ? "text-red-400"
    : progress >= 50
      ? "text-orange-400"
      : "text-green-400";

  const badgeBg = progress >= 80
    ? "bg-red-500/20 text-red-400 border-red-500/30"
    : progress >= 50
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-green-500/20 text-green-400 border-green-500/30";

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 font-bold text-xs ${textColor}`}>
          <Clock size={13} />
          {taskState.text}
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${badgeBg}`}>
          ACTIVE
        </span>
      </div>
      {showProgress && (
        <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-1.5 rounded ${barColor}`}
          />
        </div>
      )}
    </div>
  );
};

export default TaskCountdown;