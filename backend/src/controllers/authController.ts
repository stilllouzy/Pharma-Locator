import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createNotification } from "./notificationController";

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 🔔 FIND ADMIN
    const admin = await User.findOne({ role: "admin" });

    // 🔔 CREATE ADMIN NOTIFICATION
    if (admin) {
      await createNotification(
        admin._id.toString(),
        "New User Registration",
        `${user.name} created a new account`,
        "system"
      );
    }

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // 🔥 create token safely
    const payload: any = {
      id: user._id,
      role: user.role,
    };

    if (user.role === "pharmacy" && user.pharmacyId) {
      payload.pharmacyId = user.pharmacyId;
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        pharmacyId: user.pharmacyId ?? null,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error); // add logging
    res.status(500).json({ message: "Server Error" });
  }
};