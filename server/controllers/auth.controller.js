import User from "../models/auth.model.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { compare } from "bcrypt";
import { renameSync, unlinkSync } from "fs";

const maxAge = 3 * 24 * 60 * 60;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({ email, password });
    if (!user) {
      return res.status(400).json({ message: "User creation failed" });
    }
    res.cookie("jwt", createToken(user.email, user._id), {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "None",
      secure: true,
    });
    
    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.cookie("jwt", createToken(user.email, user._id), {
      httpOnly: true,
      maxAge: maxAge * 1000,
      sameSite: "None",
      secure: true,
    });
    
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color,
        profileSetup: user.profileSetup,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getUserInfo = async (req, res) => {
  try {
    // console.log(req.userId);
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User data fetched successfully",
      user: {
        id: userData._id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        color: userData.color,
        profileSetup: userData.profileSetup,
        image: userData.image,
      },
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, color } = req.body;
    if (!firstName && !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }
    if (!firstName) {
      return res.status(400).json({ message: "First name is required" });
    }
    if (!lastName) {
      return res.status(400).json({ message: "Last name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, color, profileSetup: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        color: user.color,
        profileSetup: user.profileSetup,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const updateProfileImage = async (req, res) => {
  if(!req.file){
    return res.status(400).json({ message: "No file uploaded" });
  }
  const date = Date.now();
  const fileName = `uploads/profiles/${date}-${req.file.originalname}`;
  renameSync(req.file.path, fileName);
  const updatedUser = await User.findByIdAndUpdate(
    req.userId,
    { image: fileName },
    { new: true, runValidators: true }
  );
  return res.status(200).json({
    message: "Profile image updated successfully",
    user: {
      id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      color: updatedUser.color,
      profileSetup: updatedUser.profileSetup,
      image: updatedUser.image,
    },
  });
}

export const deleteProfileImage = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  if (user.image) {
    unlinkSync(user.image);
    user.image = null;
    await user.save();
  }
  return res.status(200).json({
    message: "Profile image deleted successfully",
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      color: user.color,
      profileSetup: user.profileSetup,
      image: user.image,
    },
  });
}

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
