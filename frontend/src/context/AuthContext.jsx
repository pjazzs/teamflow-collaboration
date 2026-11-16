import { useCallback, useEffect, useState } from "react";

import authService from "../services/authService";
import AuthContext from "./AuthContextObject";
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("teamflow_token")),
  );

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);

    const { token, user: loggedInUser } = response.data;

    localStorage.setItem("teamflow_token", token);
    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);

    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("teamflow_token");
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const token = localStorage.getItem("teamflow_token");

    if (!token) return;

    const loadUser = async () => {
      try {
        const response = await authService.getCurrentUser();

        if (!cancelled) {
          setUser(response.data.user);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem("teamflow_token");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
