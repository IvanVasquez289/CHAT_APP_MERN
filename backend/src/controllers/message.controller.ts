import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Message } from "../models/message.model";
import cloudinary from "../lib/cloudinary";
import { getReceiverSocketId, io } from "../lib/socket.io";

export const getUsersForSidebar = async (req: Request, res: Response) => {
    try {
        const loggedInUserId = req.user?._id;
        const filteredUsers = await User.find({_id: { $ne: loggedInUserId } }).select("-password -__v");
        res.status(200).json(filteredUsers)
    } catch (error) {
        console.error("Error fetching users for sidebar:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { id: userTochatId } = req.params;
        const myId = req.user?._id;
        
        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: userTochatId},
                {senderId: userTochatId, receiverId: myId}
            ]
        })

        res.status(200).json(messages)
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user?._id;
        const { text, image } = req.body;
        if (!text && !image) {
            res.status(400).json({ message: "Message text or image is required" });
            return;
        }

        let imageUrl;
        if(image) {
            // upload base64 image to cloudinary
            const uploadImage = await cloudinary.uploader.upload(image)
            imageUrl = uploadImage.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        await newMessage.save();
        res.status(201).json(newMessage)

        // TODO: REAL TIME FUNCTIONALITY WITH SOCKET.IO
        const receiverSockerId = getReceiverSocketId(receiverId);
        if(receiverSockerId){
            io.to(receiverSockerId).emit("newMessage", newMessage)
        }
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}