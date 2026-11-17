import { useCallback, useEffect, useState } from "react";
import taskService from "../services/taskService";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const useTasks = (projectId = null) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);

        setError("");

        const response = await taskService.getTasks(projectId);
        setTasks(response.data || []);

        return { success: true };
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);

        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [projectId],
  );

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      try {
        const response = await taskService.getTasks(projectId);

        if (!cancelled) {
          setTasks(response.data || []);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const createTask = async (taskData) => {
    try {
      setError("");

      const response = await taskService.createTask(taskData);
      await fetchTasks(false);

      return { success: true, data: response.data };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      setError("");

      const response = await taskService.updateTask(taskId, taskData);
      await fetchTasks(false);

      return { success: true, data: response.data };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    }
  };

  // Update status using the dedicated role-aware endpoint
  const updateTaskStatus = async (taskId, status) => {
    try {
      setError("");

      const response = await taskService.updateTaskStatus(taskId, status);

      await fetchTasks(false);

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return {
        success: false,
        error: message,
      };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setError("");

      await taskService.deleteTask(taskId);
      await fetchTasks(false);

      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  };
};

export default useTasks;
