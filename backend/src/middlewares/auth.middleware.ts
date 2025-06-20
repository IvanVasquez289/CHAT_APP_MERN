import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt-adapter";
import { User } from "../models/user.model";

type DecodedToken = {
    userId?: string;
    iat: number;
    exp: number;
}
export const protectRoute = async (req: Request, res:Response, next:NextFunction) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            res.status(401).json({ message: "Unauthorized access - Not token provided" });
            return;
        }
        const decoded = verifyToken(token) as DecodedToken;
        
        if (!decoded) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }

        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            res.status(401).json({ message: "User not found" });
            return;
        }
        req.user = user; // Attach user to request body
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}