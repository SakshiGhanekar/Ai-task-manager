import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertTriangle, Timer, Tag } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({
  createdAt,
  estimatedHours,
  category,
  status,
  showProgress = true,
}) => {
  const est = Number(estimatedHours) || 0;
  
  // Calculate remaining seconds based on creation time
  const calculateRemainSecs = () => {
    if (est <= 0) return 0;
    const now = Date.now();
    const created = createdAt ? new Date(createdAt).getTime() : now;
    const elapsedSecs = Math.max(0, Math.floor((now - created) / 1000));
    return Math.max(0, est * 3600 - elapsedSecs);
  };

  const [remainSecs, setRemainSecs] = useState(calculateRemainSecs());

  useEffect(() => {
    if (status === "DONE" || remainSecs <= 0) return;
    const interval = setInterval(() => {
      setRemainSecs(calculateRemainSecs());
    }, 1000);
    return () => clearInterval(interval);
  }, [status, est, createdAt]);

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

  return null;
};

export default TaskCountdown;
