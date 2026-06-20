import React, { useState, useEffect } from "react";
import { Clock, Play, Square, Timer } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({ status }) => {
  const [inputMinutes, setInputMinutes] = useState("");
  const [remainingSecs, setRemainingSecs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [initialSecs, setInitialSecs] = useState(0);

  useEffect(() => {
    let interval;
    if (isRunning && remainingSecs > 0) {
      interval = setInterval(() => {
        setRemainingSecs((prev) => prev - 1);
      }, 1000);
    } else if (remainingSecs === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, remainingSecs]);

  if (status === "DONE") return null;

  const handleStart = () => {
    const mins = parseInt(inputMinutes);
    if (!isNaN(mins) && mins > 0) {
      const secs = mins * 60;
      setRemainingSecs(secs);
      setInitialSecs(secs);
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setRemainingSecs(0);
    setInputMinutes("");
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const progress = initialSecs > 0 ? ((initialSecs - remainingSecs) / initialSecs) * 100 : 0;

  return (
    <div className="mt-3 bg-slate-800/50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <Timer size={14} className="text-primary-500" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Custom Timer</span>
      </div>
      
      {!isRunning && remainingSecs === 0 ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            placeholder="Mins"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-white w-20 outline-none focus:border-primary-500"
          />
          <button
            onClick={handleStart}
            className="flex items-center gap-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-xs font-bold transition-colors"
          >
            <Play size={12} fill="currentColor" />
            Start
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-primary-500 text-sm font-bold tabular-nums">
              <Clock size={14} />
              {formatTime(remainingSecs)}
            </div>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-1 rounded text-[10px] font-bold transition-colors"
            >
              <Square size={10} fill="currentColor" />
              Stop
            </button>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full bg-primary-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCountdown;
