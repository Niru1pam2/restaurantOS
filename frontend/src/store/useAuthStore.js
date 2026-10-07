import { create } from "zustand";
import { getMe, loginUser, logoutUser, registerUser } from "../api/auth.api";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  checkAuthStatus: async () => {
    set({ loading: true });
    try {
      const data = await getMe();
      const userData = data?.user || data;
      if (userData && userData.id) {
        set({ user: userData, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  login: async (credentials) => {
    set({ error: null });
    try {
      const data = await loginUser(credentials);
      const userData = data?.user || data;
      set({ user: userData });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      set({ error: msg });
      throw err;
    }
  },

  register: async (userDataInput) => {
    set({ error: null });
    try {
      const data = await registerUser(userDataInput);
      const userData = data?.user || data;
      set({ user: userData });
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
      set({ error: msg });
      throw err;
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ user: null });
    }
  },

  logoutUser: () => {
    set({ user: null });
  },
}));

export const useAuth = useAuthStore;
