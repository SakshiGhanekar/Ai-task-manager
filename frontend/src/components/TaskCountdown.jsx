import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertTriangle, Timer, Activity } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({
  estimatedHours,
  completedHours,
  status,
  showProgress = true,
}) => {
  const est = Number(estimatedHours) || 0;
  const comp = Number(completedHours) || 0;
  const initialRemainSecs = Math.max(0, (est - comp) * 3600);

  const [remainSecs, setRemainSecs] = useState(initialRemainSecs);

  useEffect(() => {
    // Sync if props change
    setRemainSecs(Math.max(0, (est - comp) * 3600));
  }, [est, comp]);

  useEffect(() => {
    if (status === "DONE" || remainSecs <= 0) return;
    const interval = setInterval(() => {
      setRemainSecs(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, remainSecs]);

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

  const progress = est > 0 
    ? Math.min(100, Math.max(0, ((est * 3600 - remainSecs) / (est * 3600)) * 100)) 
    : 0;

  const h = Math.floor(remainSecs / 3600);
  const m = Math.floor((remainSecs % 3600) / 60);
  const s = Math.floor(remainSecs % 60);
  
  let text = "0h 0m 0s";
  if (est > 0) {
    text = `${h}h ${m}m ${s}s`;
  }

  let colorBase = "text-green-400";
  let badgeColor = "bg-green-500/20 text-green-400 border border-green-500/30";
  let barColor = "bg-green-400";
  let statusText = "ACTIVE";
  let Icon = Clock;
  let animatePulse = false;

  if (est > 0 && remainSecs <= 0) {
    colorBase = "text-red-500";
    badgeColor = "bg-red-500 text-white border border-red-500";
    barColor = "bg-red-500";
    statusText = "OVERDUE";
    Icon = AlertTriangle;
    text = "Time Up";
    animatePulse = true;
  } else if (progress >= 50 && est > 0) {
    colorBase = "text-orange-400";
    badgeColor = "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    barColor = "bg-orange-400";
  }

  return (
    <div className="mt-3">
      {/* NEW: Show User Input Timings */}
      <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <Timer size={11} className="text-primary-500" />
          EST: {est}h
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
          <Activity size={11} className="text-accent-500" />
          COMP: {comp}h
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 text-xs font-bold ${colorBase}`}>
          <motion.div animate={animatePulse ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }}>
            <Icon size={13} />
          </motion.div>
          <span className="tabular-nums tracking-tight">{text}</span>
        </div>

        <span className={`px-2 py-1 rounded text-[10px] font-bold ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      {showProgress && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden shadow-inner">
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
