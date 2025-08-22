import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUser: [],
    socket: null,
    is2faRequired: false,
    emailFor2fa: "",
    isVerifying2fa: false,
    isResending2fa: false,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set ({authUser:res.data});
            get().connectSocket();
        } catch (error) {
            console.log("Lỗi kiểm tra đăng ký: ", error);
            set ({authUser: null});
        } finally {
            set ({isCheckingAuth: false});
        }
    },
    signup: async(data) => {
        set ({isSigningUp: true});
        try {
            const res = await axiosInstance.post("/auth/dangky", data);
            set({authUser: res.data});
            toast.success("Tạo tài khoản thành công");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);

        } finally {
            set({isSigningUp: false});
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/dangxuat");
            set ({authUser: null});
            toast.success("Đăng xuất thành công");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    login: async (data) => {
        set ({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/dangnhap", data);
            if (res.data.message === "A 2FA code has been sent to your email.") {
                set({ is2faRequired: true, emailFor2fa: res.data.email });
                toast.success(res.data.message);
            } else {
                set ({ authUser: res.data });
                toast.success("Đăng nhập thành công");
                get().connectSocket();
            }
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isLoggingIn: false});
        }
    },

    verifyTwoFactorAuth: async (data) => {
        set({ isVerifying2fa: true });
        try {
            const res = await axiosInstance.post("/auth/verify-2fa", data);
            set({ authUser: res.data, is2faRequired: false, emailFor2fa: "" });
            toast.success("Đăng nhập thành công");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isVerifying2fa: false });
        }
    },

    resendTwoFactorCode: async (data) => {
        set({ isResending2fa: true });
        try {
            const res = await axiosInstance.post("/auth/resend-2fa-code", data);
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isResending2fa: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
          const res = await axiosInstance.put("/auth/update-profile", data);
          set({ authUser: res.data });
          toast.success("Cập nhật thành công");
        } catch (error) {
          console.log("error in update profile:", error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        const socket = io(BASE_URL, {
            query: {
                userId: authUser._id,
            },
        }
        );
        socket.connect();

        set ({ socket:socket });

        socket.on("getOnlineUsers", (userId) => {
            set ({ onlineUser: userId });
        });
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
    
}));
