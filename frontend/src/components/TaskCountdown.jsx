import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({ createdAt, dueDate, estimatedHours = 0, status, showProgress = true }) => {
  const [taskState, setTaskState] = useState(null);

  useEffect(() => {
    if (status === "DONE") {
      setTaskState({ status: "DONE", text: "Task Completed", progress: 100 });
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      
      // Calculate due timestamp
      let dueStr = dueDate;
      if (!dueStr) {
        // If due date is completely missing, calculate dynamically so it's never instantly overdue
        dueStr = new Date(now + (estimatedHours || 2) * 3600000).toISOString();
      } else if (Array.isArray(dueStr)) {
        // Handle Java Array format
        dueStr = new Date(Date.UTC(dueStr[0], dueStr[1] - 1, dueStr[2], dueStr[3] || 0, dueStr[4] || 0, dueStr[5] || 0)).toISOString();
      } else if (typeof dueStr === 'string' && dueStr.includes('T') && !dueStr.endsWith('Z')) {
        // Handle missing timezone from backend
        dueStr += "Z";
      }

      // Exact Logic Requested:
      const due = new Date(dueStr).getTime();
      const diff = due - now;

      console.log("NOW:", new Date(now));
      console.log("DUE:", new Date(due));
      console.log("DIFF:", diff);

      if (isNaN(due)) {
        setTaskState(null);
        return;
      }

      // Calculate startMs for progress bar
      let startMs = due - ((estimatedHours || 2) * 3600000);
      if (createdAt) {
        if (Array.isArray(createdAt)) {
          startMs = Date.UTC(createdAt[0], createdAt[1] - 1, createdAt[2], createdAt[3] || 0, createdAt[4] || 0, createdAt[5] || 0);
        } else {
          let cStr = String(createdAt);
          if (cStr.includes('T') && !cStr.endsWith('Z')) cStr += "Z";
          startMs = new Date(cStr).getTime();
        }
      }

      const totalDuration = due - startMs;
      const elapsed = now - startMs;
      const progress = totalDuration > 0 ? Math.max(0, Math.min(100, (elapsed / totalDuration) * 100)) : 0;

      // Exact Logic Requested:
      if (diff <= 0) {
        setTaskState({ status: "OVERDUE", text: "Task Overdue", progress: 100 });
      } else {
        const remainingHours = diff / (1000 * 60 * 60);
        const days = Math.floor(remainingHours / 24);
        const hours = Math.floor(remainingHours % 24);
        const minutes = Math.floor((remainingHours % 1) * 60);

        let text = "";
        if (days > 0) text = `${days}d ${hours}h Left`;
        else if (hours > 0) text = `${hours}h ${minutes}m Left`;
        else text = `${minutes}m Left`;

        setTaskState({ status: "ACTIVE", text, progress });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [createdAt, dueDate, estimatedHours, status]);

  if (!taskState) return null;

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

  if (taskState.status === "OVERDUE") {
    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-red-500 font-bold text-xs">
            <AlertTriangle size={13} />
            {taskState.text}
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

  const { progress } = taskState;
  const barColor = progress >= 80 ? "bg-red-500" : progress >= 50 ? "bg-orange-400" : "bg-green-400";
  const textColor = progress >= 80 ? "text-red-400" : progress >= 50 ? "text-orange-400" : "text-green-400";
  const badgeBg = progress >= 80 ? "bg-red-500/20 text-red-400 border-red-500/30" : progress >= 50 ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-green-500/20 text-green-400 border-green-500/30";

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