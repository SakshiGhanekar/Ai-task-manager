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
  
  // Helper to parse server timestamps as local time (removes forced UTC 'Z')
  const parseLocal = (val) => {
    if (!val) return null;
    let s = String(val);
    if (s.endsWith('Z')) s = s.slice(0, -1);
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.getTime();
  };

  const getTargetTime = () => {
    const baseTime = parseLocal(updatedAt) || parseLocal(createdAt) || Date.now();
    const dynamicTarget = baseTime + (est > 0 ? est * 3600000 : 0);
    if (dueDate) {
      const parsedDue = parseLocal(dueDate);
      if (parsedDue) return Math.max(parsedDue, dynamicTarget);
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
  const createdTime = parseLocal(createdAt) || (targetTime - (est > 0 ? est * 3600000 : 3600000));
  
  const totalSecs = Math.floor((targetTime - createdTime) / 1000);
  const progress = totalSecs > 0 
    ? Math.min(100, Math.max(0, ((totalSecs - remainSecs) / totalSecs) * 100)) 
    : 0;

  const h = Math.floor(remainSecs / 3600);
  const m = Math.floor((remainSecs % 3600) / 60);
  const s = Math.floor(remainSecs % 60);
  
  let text = "";
  let hasDeadline = est > 0 || dueDate;

  if (hasDeadline) {
    if (remainSecs <= 0) {
      text = "Time Completed";
    } else {
      text = `${h}h ${m}m ${s}s`;
    }
  } else {
    text = "Ongoing Task";
  }

  // Use a pleasant unified color scheme instead of scary reds
  let barColor = "bg-primary-500";
  let textColor = "text-primary-400";

  if (!hasDeadline) {
    barColor = "bg-slate-700";
    textColor = "text-slate-400";
  } else if (remainSecs <= 0) {
    barColor = "bg-green-500";
    textColor = "text-green-500";
  } else {
    barColor = "bg-primary-500";
    textColor = "text-primary-400";
  }

  // To display the start/updated time in Indian Standard Time (IST)
  const getStartTimeIST = () => {
    const base = parseLocal(updatedAt) || parseLocal(createdAt) || Date.now();
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
