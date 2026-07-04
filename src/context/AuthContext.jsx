import { createContext, useContext, useEffect, useState } from "react";
import api, {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const storeSession = (data) => {
    if (data.access) localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
    if (data.refresh) localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
    if (data.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login/", { email, password });
    storeSession(data);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register/", { name, email, password });
    storeSession(data);
    return data.user;
  };

  const logout = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refresh) {
      // Best-effort blacklist; clear locally regardless of the result.
      try {
        await api.post("/auth/logout/", { refresh });
      } catch {
        /* ignore network/token errors on logout */
      }
    }
    clearSession();
  };

  // Update the cached user (used by profile updates in a later phase).
  const updateUser = (updated) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  // The axios layer dispatches this when a token refresh fails.
  useEffect(() => {
    const onForcedLogout = () => clearSession();
    window.addEventListener("auth:logout", onForcedLogout);
    return () => window.removeEventListener("auth:logout", onForcedLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
