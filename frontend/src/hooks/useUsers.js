import { useCallback, useEffect, useState } from "react";

import userService from "../services/userService";
import getApiErrorMessage from "../utils/getApiErrorMessage";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(
    async ({
      page = pagination.page,
      searchTerm = search,
      showLoading = true,
    } = {}) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const response = await userService.getUsers({
          page,
          limit: pagination.limit,
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
        });

        setUsers(response.data?.users || []);
        setPagination(
          response.data?.pagination || {
            total: 0,
            page,
            limit: pagination.limit,
            totalPages: 0,
          },
        );

        return { success: true };
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);

        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, search],
  );

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const response = await userService.getUsers({
          page: 1,
          limit: pagination.limit,
        });

        if (!cancelled) {
          setUsers(response.data?.users || []);
          setPagination(
            response.data?.pagination || {
              total: 0,
              page: 1,
              limit: pagination.limit,
              totalPages: 0,
            },
          );
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

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [pagination.limit]);

  const searchUsers = async (searchTerm) => {
    setSearch(searchTerm);

    return fetchUsers({
      page: 1,
      searchTerm,
    });
  };

  const changePage = async (page) => {
    if (
      page < 1 ||
      (pagination.totalPages > 0 && page > pagination.totalPages)
    ) {
      return { success: false };
    }

    return fetchUsers({ page });
  };

  const updateUserRole = async (userId, role) => {
    try {
      setError("");

      const response = await userService.updateUserRole(userId, role);

      await fetchUsers({ showLoading: false });

      return {
        success: true,
        data: response.data?.user,
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

  const updateUserStatus = async (userId, isActive) => {
    try {
      setError("");

      const response = await userService.updateUserStatus(userId, isActive);

      await fetchUsers({ showLoading: false });

      return {
        success: true,
        data: response.data?.user,
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

  return {
    users,
    pagination,
    search,
    loading,
    error,
    setSearch,
    fetchUsers,
    searchUsers,
    changePage,
    updateUserRole,
    updateUserStatus,
  };
};

export default useUsers;
