import { create } from "zustand";
import axios from 'axios'
import toast from "react-hot-toast";

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  login: async (userCred) => {
   // const { role, ...userCredObj } = userCredWithRole;
    try {
      //set loading true
      set((state) => ({ ...state, loading: true }))
      //make api call
      let res = await axios.post("http://localhost:3000/auth/login", userCred, { withCredentials: true })
      //update state
      if (res.status === 200) {
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          error: null,
        })
      }
    } catch (err) {
      console.log("err is ", err);
      const backendMsg = err.response?.data?.error || err.response?.data?.message;
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        //error: err,
        error: backendMsg || "Login failed",
      });
    }
  },
  logout: async () => {
    try {
      //set loading state
      //make logout api req
      let res = await axios.get("http://localhost:3000/auth/logout", { withCredentials: true })
      //update state
      if (res.status === 200) {
        toast.success("Logout successful")
        set({
          currentUser: null,
          loading: false,
          isAuthenticated: false,
          error: null,
        })
      }
    } catch (err) {
      const backendMsg = err.response?.data?.error || err.response?.data?.message;
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: backendMsg || "Logout failed",
      });
    }
  },
  // restore login
  checkAuth: async () => {
    try {
      set({ loading: true });
      const res = await axios.get("http://localhost:3000/auth/check-auth", { withCredentials: true });

      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
      });
    } catch (err) {
      // If user is not logged in → do nothing
      if (err.response?.status === 401) {
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // other errors
      console.error("Auth check failed:", err);
      set({ loading: false });
    }
  },
}));



