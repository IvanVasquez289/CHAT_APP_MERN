import { create } from "zustand";
import { axioInstance } from "../lib/axios";
import type { AuthUser, LoginData, SignUpData } from "../types";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";


type AuthState = {
    authUser: AuthUser | null;
    isCheckingAuth: boolean;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    checkAuth: () => Promise<void>;
    signup: (data: SignUpData) => Promise<void>;
    login: (data: LoginData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (profilePic: string) => Promise<void>;
    onlineUsers: string[],
    socket: ReturnType<typeof io> | null,
    connectSocket: () => void,
    disconnectSocket: () => void
}

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:4000/api" : "/"

export const useAuthStore = create<AuthState>((set,get)=> ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,
    
    checkAuth: async () => {
        try {
            const res = await axioInstance.get("/auth/check");
            set({authUser: res.data})
            get().connectSocket()
        } catch (error) {
            console.log("Error checking authentication:", error);
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (data: SignUpData) => {
        set({isSigningUp: true})
        try {
            const res = await axioInstance.post("/auth/signup", data);
            set({authUser: res.data})
            get().connectSocket()
            toast.success("Account created successfully")
        } catch (error) {
            if(error instanceof AxiosError && error.response?.status !== 400){
                toast.error("User already exists")
                console.log(error.response?.data.message)
            }
        }finally{
            set({isSigningUp: false})
        }
    },

    logout: async () => {
        try {
            await axioInstance.post("/auth/logout");
            set({authUser: null})
            get().disconnectSocket()
            toast.success("Logged out successfully")
        } catch (error) {
            if(error instanceof AxiosError){
                toast.error(error.response?.data.message)
            }
        }
    },
    login: async (data: LoginData) => {
        set({isLoggingIn: true})
        try {
            const res = await axioInstance.post("/auth/login", data)
            set({authUser: res.data})
            get().connectSocket()
            toast.success("Logged in successfully")
        } catch (error) {
            if(error instanceof AxiosError){
                const {response, status} = error
                if(status !== 400){
                    toast.error(response?.data.message)
                }
                console.log(response?.data.message)
            }
        }finally{
            set({isLoggingIn: false})
        }
    },
    updateProfile: async (profilePic: string) => {
        set({isUpdatingProfile: true})
        try {
            const res = await axioInstance.put("/auth/update-profile", {profilePic})
            set({authUser: res.data})
            toast.success("Profile updated successfully")
        } catch (error) {
            if(error instanceof AxiosError){
                toast.error(error.message)
                console.log(error.response?.data.message)
                if(error.code === "ERR_NETWORK"){
                    toast.error("Image upload failed, try another image")
                }
            }
        }finally{
            set({isUpdatingProfile: false})
        }
    },
    connectSocket: () => {
        const {authUser} = get()
        if(!authUser || get().socket?.connected) return
        const socket = io(BASE_URL,{
            query: {
                userId: authUser._id
            }
        })

        set({socket})
        socket.on("getConnectedUsers", (userIds) => {
            set({onlineUsers: userIds})
        })
    },
    disconnectSocket: () => {
        if(get().socket?.connected) get().socket?.disconnect()
        set({socket: null})
    }
}))