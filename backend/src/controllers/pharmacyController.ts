import { Request, Response } from "express";
import Pharmacy from "../models/Pharmacy";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE PHARMACY (pharmacy user)
export const createPharmacy = async (req: AuthRequest, res: Response) => {
  try {
    const { name, address, contactNumber, lat, lng } = req.body;

    const pharmacy = await Pharmacy.create({
      name,
      owner: req.user.id,
      address,
      contactNumber,
      location: { lat, lng },
    });

    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: "Error creating pharmacy" });
  }
};

// GET ALL PHARMACIES (for users)
export const getApprovedPharmacies = async (req: Request, res: Response) => {
  try {
    const pharmacies = await Pharmacy.find({ isApproved: true }).populate(
      "owner",
      "name email"
    );

    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pharmacies" });
  }
};

// ADMIN: GET ALL (including pending)
export const getAllPharmacies = async (req: Request, res: Response) => {
  try {
    const pharmacies = await Pharmacy.find().populate("owner", "name email");
    res.json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all pharmacies" });
  }
};

// ADMIN: APPROVE PHARMACY
export const approvePharmacy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pharmacy = await Pharmacy.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: "Error approving pharmacy" });
  }
};