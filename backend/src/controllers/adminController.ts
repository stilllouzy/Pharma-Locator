import { Request, Response } from "express";
import User from "../models/User";
import Pharmacy from "../models/Pharmacy";
import bcrypt from "bcryptjs";

// ADMIN: CREATE PHARMACY ACCOUNT
export const createPharmacyAccount = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      pharmacyName,
      address,
      contactNumber,
      lat,
      lng,
    } = req.body;

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user (pharmacy role)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "pharmacy",
    });

    // create pharmacy (auto-approved)
    const pharmacy = await Pharmacy.create({
      name: pharmacyName,
      owner: user._id,
      address,
      contactNumber,
      location: { lat, lng },
      isApproved: true,
    });

    // link pharmacy to user
    user.pharmacyId = pharmacy._id;
    await user.save();

    res.status(201).json({
      message: "Pharmacy account created successfully",
      user,
      pharmacy,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating pharmacy account" });
  }
};