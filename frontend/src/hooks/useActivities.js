import { useCallback, useEffect, useState } from "react";
import activityService from "../services/activityService";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const useActivities = (limit = 20) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await activityService.getActivities(limit);

      setActivities(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let cancelled = false;

    const loadActivities = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await activityService.getActivities(limit);

        if (!cancelled) {
          setActivities(response.data || []);
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

    loadActivities();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return {
    activities,
    loading,
    error,
    refreshActivities: fetchActivities,
  };
};

export default useActivities;
