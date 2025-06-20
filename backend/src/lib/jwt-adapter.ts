import { Response } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";


export const generateToken = (userId:Types.ObjectId, res:Response) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET!, {
        expiresIn: "7d"
    })
    
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // only accessible by the server
        secure: process.env.NODE_ENV !== "development", // use secure cookies in production
        sameSite: "strict" // prevent CSRF attacks
    })
    
    return token
}

export const verifyToken = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET!)
}