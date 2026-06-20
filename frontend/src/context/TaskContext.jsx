import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    setTimeout(() => {
      let savedTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');

      // Repair any tasks that are missing createdAt (corrupted by old bug)
      let repaired = false;
      savedTasks = savedTasks.map(t => {
        let modified = false;
        if (!t.createdAt) {
          t.createdAt = new Date().toISOString();
          modified = true;
        }

        // MIGRATION: Fix old tasks that have missing dueDate, or dueDate without time (YYYY-MM-DD),
        // which causes them to be instantly overdue at 00:00 UTC.
        if (!t.dueDate || (typeof t.dueDate === 'string' && t.dueDate.length === 10)) {
          // Regenerate the due date correctly based on when it was created + estimated hours
          const start = new Date(t.createdAt).getTime();
          const hours = t.estimatedHours ? parseInt(t.estimatedHours) : 2; // default 2 hours
          t.dueDate = new Date(start + hours * 3600000).toISOString();
          modified = true;
        }

        if (modified) repaired = true;
        return t;
      });
      if (repaired) {
        localStorage.setItem('mockTasks', JSON.stringify(savedTasks));
      }

      if (filters.status) {
        savedTasks = savedTasks.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        savedTasks = savedTasks.filter(t => t.priority === filters.priority);
      }
      if (filters.search) {
        savedTasks = savedTasks.filter(t => t.title.toLowerCase().includes(filters.search.toLowerCase()));
      }

      setTasks(savedTasks);
      setTotalPages(1);
      setPage(0);
      setLoading(false);
    }, 400);
  }, []);

  const fetchStats = useCallback(async () => {
    let savedTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
    setStats({
      totalTasks: savedTasks.length,
      completedTasks: savedTasks.filter(t => t.status === 'DONE').length,
      pendingTasks: savedTasks.filter(t => t.status === 'TODO').length,
      inProgressTasks: savedTasks.filter(t => t.status === 'IN_PROGRESS').length,
      highPriorityTasks: savedTasks.filter(t => t.priority === 'HIGH').length,
    });
  }, []);

  const createTask = async (taskData) => {
    let savedTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
    const now = new Date();

    const estimatedHours = Number(taskData.estimatedHours || 1);

    const dueDateTime = new Date(
      Date.now() + estimatedHours * 60 * 60 * 1000
    );

    const newTask = {
      ...taskData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      dueDate: dueDateTime.toISOString(),
    };
    savedTasks.unshift(newTask);
    localStorage.setItem('mockTasks', JSON.stringify(savedTasks));
    await fetchTasks();
    await fetchStats();
    return newTask;
  };


  const updateTask = async (id, taskData) => {
    let savedTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
    savedTasks = savedTasks.map(t => {
      if (t.id === id) {
        // CRITICAL: always preserve the original createdAt so countdown doesn't reset
        return { ...t, ...taskData, createdAt: t.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
      }
      return t;
    });
    localStorage.setItem('mockTasks', JSON.stringify(savedTasks));
    await fetchTasks();
    await fetchStats();
    return taskData;
  };

  const deleteTask = async (id) => {
    let savedTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]');
    savedTasks = savedTasks.filter(t => t.id !== id);
    localStorage.setItem('mockTasks', JSON.stringify(savedTasks));
    await fetchTasks();
    await fetchStats();
  };

  const generateWithAi = async (title) => {
    // Mocked AI Response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          description: `Automatically generated description for: ${title}. This task requires careful attention to detail and coordination with the team.`,
          priority: "HIGH",
          estimatedTime: "3 Hours"
        });
      }, 1500);
    });
  };

  return (
    <TaskContext.Provider value={{
      tasks, stats, loading, page, totalPages,
      fetchTasks, fetchStats, createTask, updateTask, deleteTask, generateWithAi
    }}>
      {children}
    </TaskContext.Provider>
  );
};
