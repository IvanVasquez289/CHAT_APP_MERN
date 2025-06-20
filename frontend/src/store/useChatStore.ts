import { create } from "zustand";
import type { ChatUser, Message, MessageData } from "../types";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { axioInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

type ChatState = {
    users: ChatUser[],
    messages: Message[],
    selectedUser: ChatUser | null,
    isUsersLoading: boolean,
    isMessagesLoading: boolean,
    getUsers: () => void,
    getMessages : (userId: ChatUser["_id"]) => void,
    setSelectedUser: (user: ChatUser | null) => void,
    sendMessage : (messageData: MessageData) => Promise<void>,
    subscribeToMessages: () => void;
    unsubscribeFromMessages: () => void
}

export const useChatStore = create<ChatState>((set,get) => ({
    users: [],
    messages: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({isUsersLoading: true})
        try {
            const res = await axioInstance.get("/message/users")
            set({users: res.data})
        } catch (error) {
            if(error instanceof AxiosError){
                toast.error(error.message)
                console.log(error.response?.data.message)
            }
        }finally{
            set({isUsersLoading: false})
        }
    },
    getMessages : async (userId: ChatUser["_id"]) => {
        set({isMessagesLoading: true})
        try {
            const res = await axioInstance.get(`/message/${userId}`)
            set({messages: res.data})
        } catch (error) {
            if(error instanceof AxiosError){
                toast.error(error.response?.data.message)
                console.log(error)
            }
        }finally{
            set({isMessagesLoading: false})
        }
    },
    // TODO: OPTIMIZE LATER
    setSelectedUser: (user: ChatUser | null) => {
        set({selectedUser: user})
    },

    sendMessage: async (messageData: MessageData ) => {
        const {selectedUser,messages} = get()
        try {
            const res = await axioInstance.post(`/message/send/${selectedUser?._id}`, messageData)  
            set({messages: [...messages, res.data]})  
        } catch (error) {
            if(error instanceof AxiosError){
                toast.error(error.response?.data.message)
                console.log(error)
            }
        }
    },
    subscribeToMessages: () => {
        const {selectedUser} = get()
        if(!selectedUser) return
        const socket = useAuthStore.getState().socket;
        socket?.on("newMessage", (newMessage: Message) => {
            if(newMessage.senderId !== selectedUser._id) return
            set({messages: [...get().messages, newMessage]})
        })
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage")
    }

}))