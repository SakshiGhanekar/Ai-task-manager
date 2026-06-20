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
      
      // Determine the target date string (YYYY-MM-DD)
      let targetDateStr = null;
      let startMs = null;

      // Robustly parse a date source (could be array from Java, string, or number)
      const extractDateStr = (dateInput) => {
        if (!dateInput) return null;
        if (Array.isArray(dateInput)) {
          return `${dateInput[0]}-${String(dateInput[1]).padStart(2, '0')}-${String(dateInput[2]).padStart(2, '0')}`;
        }
        if (typeof dateInput === 'string') {
          return dateInput.substring(0, 10);
        }
        if (typeof dateInput === 'number') {
          const d = new Date(dateInput);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        return null;
      };

      // Try dueDate first, then fallback to createdAt
      targetDateStr = extractDateStr(dueDate) || extractDateStr(createdAt);

      if (!targetDateStr) {
        setTaskState(null);
        return;
      }

      // End of that day (23:59:59) in local time
      const endOfDay = new Date(`${targetDateStr}T23:59:59`);
      const deadlineMs = endOfDay.getTime();

      if (isNaN(deadlineMs)) {
        setTaskState(null);
        return;
      }

      // Determine start time for progress bar calculation
      if (createdAt) {
        let startStr = createdAt;
        if (Array.isArray(startStr)) {
          const [y, m, d, h = 0, min = 0, s = 0] = startStr;
          startMs = new Date(y, m - 1, d, h, min, s).getTime();
        } else if (typeof startStr === 'string') {
          if (startStr.includes("T") && !startStr.endsWith("Z") && !startStr.includes("+") && !startStr.includes("-", 10)) {
            startStr += "Z";
          }
          startMs = new Date(startStr).getTime();
        } else if (typeof startStr === 'number') {
          startMs = new Date(startStr).getTime();
        }
      }
      
      if (!startMs || isNaN(startMs)) {
        // Fallback start time to beginning of the target day
        startMs = new Date(`${targetDateStr}T00:00:00`).getTime();
      }

      // Cap startMs to not exceed deadlineMs
      if (startMs >= deadlineMs) {
        startMs = deadlineMs - 24 * 60 * 60 * 1000; // 1 day before
      }

      const totalDurationMs = deadlineMs - startMs;
      const remaining = deadlineMs - now;
      const elapsed = now - startMs;

      const timeProgress = totalDurationMs > 0
        ? Math.max(0, Math.min(100, (elapsed / totalDurationMs) * 100))
        : 0;

      if (remaining <= 0) {
        setTaskState({ status: "OVERDUE", text: "Time Overdue", progress: 100 });
      } else {
        const remainingHours = remaining / (1000 * 60 * 60);
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