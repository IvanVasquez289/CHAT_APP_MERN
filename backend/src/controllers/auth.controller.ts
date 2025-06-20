import { Request, Response } from "express";
import { User } from "../models/user.model";
import { generateToken } from "../lib/jwt-adapter";
import { comparePassword, generateSalt, hashPassword } from "../lib/bcrypt-adapter";
import cloudinary from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  const { email, fullName, password } = req.body;
  try {

    if(!email || !fullName || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters long" });
      return;
    }

    const user = await User.findOne({ email });
    if (user) {
        res.status(409).json({ message: "User already exists" });
        return;
    }

    const salt = await generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });

    if (newUser) {
      // generate token here
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        fullName: newUser.fullName,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(422).json({ message: "Invalid user data" });
      return
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    return
  }
};
export const login = async (req: Request, res: Response) => {
  const {email,password} = req.body;
  try {
    if(!email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const user = await User.findOne({email})
    if(!user) {
      res.status(404).json({ message: "Invalid Credentials" });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password)
    if(!isValidPassword){
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // generate token here
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.log("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logout = (req: Request, res: Response) => {
  try {
    // Clear the token by setting it to an empty string
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const {profilePic} = req.body;
  const userId = req.user?._id;
  try {
    if(!profilePic){
      res.status(400).json({ message: "Profile picture is required" });
      return;
    }

    const uploadImage = await cloudinary.uploader.upload(profilePic)
    const updateUser = await User.findByIdAndUpdate(userId, {profilePic: uploadImage.secure_url}, {new: true});
    res.status(200).json(updateUser)
  } catch (error) {
    console.log("Error in updateProfile controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const checkAuth = (req: Request, res: Response) => {
  try {
    res.status(200).json(req.user)
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    console.log("Error in checkAuth controller:", error);
  }
}