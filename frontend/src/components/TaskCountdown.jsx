import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertTriangle, Timer } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({
  createdAt,
  updatedAt,
  estimatedHours,
  dueDate,
  status,
  showProgress = true,
}) => {
  const est = Number(estimatedHours) || 0;
  
  const getTargetTime = () => {
    const baseTime = updatedAt ? new Date(updatedAt).getTime() : (createdAt ? new Date(createdAt).getTime() : Date.now());
    const dynamicTarget = baseTime + (est > 0 ? est * 3600000 : 0);
    if (dueDate) {
      return Math.max(new Date(dueDate).getTime(), dynamicTarget);
    }
    return dynamicTarget;
  };

  const calculateRemainSecs = () => {
    const now = Date.now();
    const targetTime = getTargetTime();
    const diffSecs = Math.floor((targetTime - now) / 1000);
    return Math.max(0, diffSecs);
  };

  const [remainSecs, setRemainSecs] = useState(calculateRemainSecs());

  useEffect(() => {
    setRemainSecs(calculateRemainSecs());
    
    if (status === "DONE") return;
    
    const interval = setInterval(() => {
      const current = calculateRemainSecs();
      setRemainSecs(current);
      if (current <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [status, est, createdAt, updatedAt, dueDate]);

  if (status === "DONE") {
    return (
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
          <CheckCircle size={13} />
          Task Completed
        </div>
        <span className="px-2 py-1 rounded bg-green-500 text-white text-[10px] font-bold">
          DONE
        </span>
      </div>
    );
  }

  const now = Date.now();
  const targetTime = getTargetTime();
  const createdTime = createdAt ? new Date(createdAt).getTime() : targetTime - (est > 0 ? est * 3600000 : 3600000);
  
  const totalSecs = Math.floor((targetTime - createdTime) / 1000);
  const progress = totalSecs > 0 
    ? Math.min(100, Math.max(0, ((totalSecs - remainSecs) / totalSecs) * 100)) 
    : 0;

  const h = Math.floor(remainSecs / 3600);
  const m = Math.floor((remainSecs % 3600) / 60);
  const s = Math.floor(remainSecs % 60);
  
  let text = "0h 0m 0s";
  let hasDeadline = est > 0 || dueDate;

  if (hasDeadline) {
    if (remainSecs <= 0) {
      text = "Expired";
    } else {
      text = `${h}h ${m}m ${s}s`;
    }
  } else {
    text = "No Time Limit";
  }

  let barColor = "bg-green-400";
  let textColor = "text-slate-500 dark:text-slate-400";

  // Change colors based on progress percentage if there is a deadline
  if (!hasDeadline) {
    barColor = "bg-slate-500";
    textColor = "text-slate-400";
  } else if (progress >= 80 || remainSecs <= 0) {
    barColor = "bg-red-500";
    textColor = "text-red-500";
  } else if (progress >= 40) {
    barColor = "bg-orange-400";
    textColor = "text-orange-400";
  } else {
    textColor = "text-green-400";
  }

  // To display the start/updated time in Indian Standard Time (IST)
  const getStartTimeIST = () => {
    const base = updatedAt ? new Date(updatedAt).getTime() : (createdAt ? new Date(createdAt).getTime() : Date.now());
    return new Date(base).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" });
  };

  const startIST = getStartTimeIST();

  return (
    <div className="mt-3">
      {startIST && (
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <Timer size={11} className="text-primary-500" />
            Started (IST): {startIST}
          </div>
        </div>
      )}

      <div className={`flex items-center gap-2 text-xs font-bold ${textColor}`}>
        <Clock size={13} />
        <span className="tabular-nums tracking-tight">{text}</span>
      </div>

      {showProgress && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shadow-inner mt-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "linear" }}
            className={`h-full rounded-full ${barColor} shadow-[0_0_10px_rgba(0,0,0,0.2)]`}
          />
        </div>
      )}
    </div>
  );
};

export default TaskCountdown;
