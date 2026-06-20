import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTasks = useCallback(async (filters = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.page !== undefined) params.append('page', filters.page);

      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
      setPage(response.data.number || 0);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      // Fallback to empty state on error so UI doesn't crash
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  }, [user]);

  const createTask = async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      await fetchTasks({ page: 0 }); // reset to first page to see new task
      await fetchStats();
      return response.data;
    } catch (error) {
      console.error("Failed to create task", error);
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await api.put(`/tasks/${id}`, taskData);
      setTasks(prev => prev.map(t => t.id === id ? response.data : t));
      await fetchStats();
      return response.data;
    } catch (error) {
      console.error("Failed to update task", error);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks({ page });
      await fetchStats();
    } catch (error) {
      console.error("Failed to delete task", error);
      throw error;
    }
  };

  const generateWithAi = async (title) => {
    try {
      const response = await api.post('/ai/generate', { title });
      // The backend returns estimatedHours instead of estimatedTime string, 
      // so we map it for the frontend components that expect estimatedTime
      return {
        ...response.data,
        estimatedTime: response.data.estimatedHours ? `${response.data.estimatedHours} Hours` : "1 Hour"
      };
    } catch (error) {
      console.error("Failed to generate with AI", error);
      throw error; // Let the component handle the error
    }
  };

  // Automatically fetch tasks and stats when user logs in
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchStats();
    } else {
      setTasks([]);
      setStats(null);
    }
  }, [user, fetchTasks, fetchStats]);

  return (
    <TaskContext.Provider value={{
      tasks, stats, loading, page, totalPages,
      fetchTasks, fetchStats, createTask, updateTask, deleteTask, generateWithAi
    }}>
      {children}
    </TaskContext.Provider>
  );
};
