import React from "react";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({
  estimatedHours,
  completedHours,
  status,
  showProgress = true,
}) => {
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

  const est = Number(estimatedHours) || 0;
  const comp = Number(completedHours) || 0;
  const remain = Math.max(0, est - comp);
  const progress = est > 0 ? Math.min(100, Math.max(0, (comp / est) * 100)) : 0;
  
  let text = "0h Left";
  if (est > 0) {
    text = `${remain}h Left`;
  }

  let colorBase = "text-green-400";
  let badgeColor = "bg-green-500/20 text-green-400 border border-green-500/30";
  let barColor = "bg-green-400";
  let statusText = "ACTIVE";
  let Icon = Clock;

  if (est > 0 && remain <= 0) {
    colorBase = "text-red-500";
    badgeColor = "bg-red-500 text-white border border-red-500";
    barColor = "bg-red-500";
    statusText = "OVERDUE";
    Icon = AlertTriangle;
    text = "Time Up";
  } else if (progress >= 50 && est > 0) {
    colorBase = "text-orange-400";
    badgeColor = "bg-orange-500/20 text-orange-400 border border-orange-500/30";
    barColor = "bg-orange-400";
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`flex items-center gap-2 text-xs font-bold ${colorBase}`}>
          <Icon size={13} />
          {text}
        </div>

        <span className={`px-2 py-1 rounded text-[10px] font-bold ${badgeColor}`}>
          {statusText}
        </span>
      </div>

      {showProgress && (
        <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={`h-full rounded ${barColor}`}
          />
        </div>
      )}
    </div>
  );
};

export default TaskCountdown;
