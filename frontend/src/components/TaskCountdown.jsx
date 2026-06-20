import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const TaskCountdown = ({
  createdAt,
  dueDate,
  status,
  showProgress = true,
}) => {
  const [taskState, setTaskState] = useState(null);

  useEffect(() => {
    if (status === "DONE") {
      setTaskState({
        status: "DONE",
        text: "Task Completed",
        progress: 100,
      });
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();

      if (!dueDate) {
        setTaskState(null);
        return;
      }

      const due = new Date(dueDate).getTime();

      if (isNaN(due)) {
        setTaskState(null);
        return;
      }

      const diff = due - now;

      let progress = 0;

      if (createdAt) {
        const created = new Date(createdAt).getTime();
        const totalDuration = due - created;
        const elapsed = now - created;

        progress =
          totalDuration > 0
            ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
            : 0;
      }

      if (diff <= 0) {
        setTaskState({
          status: "OVERDUE",
          text: "Time Overdue",
          progress: 100,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      let text = "";

      if (days > 0) {
        text = `d h Left`;
      } else if (hours > 0) {
        text = `h m Left`;
      } else {
        text = `m Left`;
      }

      setTaskState({
        status: "ACTIVE",
        text,
        progress,
      });
    };

    updateCountdown();

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [createdAt, dueDate, status]);

  if (!taskState) return null;

  if (taskState.status === "DONE") {
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

  if (taskState.status === "OVERDUE") {
    return (
      <div className="mt-3">
        <div className="flex items-center justify-end mb-2">
          <span className="px-2 py-1 rounded bg-red-500 text-white text-[10px] font-bold">
            OVERDUE
          </span>
        </div>

        <div className="w-full bg-slate-800 h-1.5 rounded">
          <div className="bg-red-500 h-full w-full rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-green-400 text-xs font-bold">
          <Clock size={13} />
          {taskState.text}
        </div>

        <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold">
          ACTIVE
        </span>
      </div>

      {showProgress && (
        <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
          <motion.div
            animate={{
              width: `%`,
            }}
            transition={{ duration: 0.5 }}
            className="h-full bg-green-400 rounded"
          />
        </div>
      )}
    </div>
  );
};

export default TaskCountdown;
