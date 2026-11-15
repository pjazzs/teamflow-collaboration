import { useCallback, useEffect, useState } from "react";
import projectService from "../services/projectService";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      setError("");

      const response = await projectService.getProjects();
      setProjects(response.data || []);

      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    projectService
      .getProjects()
      .then((response) => {
        if (!cancelled) {
          setProjects(response.data || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const createProject = async (projectData) => {
    try {
      setError("");

      const response = await projectService.createProject(projectData);
      await fetchProjects(false);

      return { success: true, data: response.data };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    }
  };

  const updateProject = async (projectId, projectData) => {
    try {
      setError("");

      const response = await projectService.updateProject(
        projectId,
        projectData,
      );

      await fetchProjects(false);

      return { success: true, data: response.data };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    }
  };

  const deleteProject = async (projectId) => {
    try {
      setError("");

      await projectService.deleteProject(projectId);
      await fetchProjects(false);

      return { success: true };
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);

      return { success: false, error: message };
    }
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

export default useProjects;
