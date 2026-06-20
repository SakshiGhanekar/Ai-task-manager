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

  const h = Math.floor(remainSecs / 3600);
  const m = Math.floor((remainSecs % 3600) / 60);
  const s = Math.floor(remainSecs % 60);
  
  let text = "0h 0m 0s";
  if (est > 0) {
    text = `${h}h ${m}m ${s}s`;
  }

  // To display the due time in Indian Standard Time (IST)
  const getDueTimeIST = () => {
    const target = getTargetTime();
    if (!target) return null;
    return new Date(target).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" });
  };

  const dueIST = getDueTimeIST();

  return (
    <div className="mt-3">
      {dueIST && (
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <Timer size={11} className="text-primary-500" />
            Due (IST): {dueIST}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <Clock size={13} />
        <span className="tabular-nums tracking-tight">{text}</span>
      </div>
    </div>
  );
};

export default TaskCountdown;
