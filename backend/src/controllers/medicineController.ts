import { Response } from "express";
import mongoose from "mongoose";
import Medicine from "../models/Medicine";
import { AuthRequest } from "../middleware/authMiddleware";

// ✅ CREATE MEDICINE
export const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, stock, category } = req.body;

    const medicine = await Medicine.create({
      name,
      description,
      price,
      stock,
      category,
      pharmacy: req.user.pharmacyId, // 🔥 link to pharmacy
    });

    res.status(201).json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating medicine" });
  }
};

// ✅ GET MY MEDICINES (PHARMACY SIDE)
export const getMyMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const medicines = await Medicine.find({
      pharmacy: req.user.pharmacyId,
    });

    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching medicines" });
  }
};

// ✅ GET ALL MEDICINES (USER SIDE - FILTERED ONLY)
export const getAllMedicines = async (req: AuthRequest, res: Response) => {
  try {
    const { search, pharmacyId } = req.query;

    // ❌ If no pharmacy selected → return empty
    if (!pharmacyId) {
      return res.json([]);
    }

    let conditions: any[] = [];

    // ✅ PHARMACY FILTER (SAFE ObjectId)
    if (typeof pharmacyId === "string" && pharmacyId.trim() !== "") {
      conditions.push({
        pharmacy: new mongoose.Types.ObjectId(pharmacyId),
      });
    }

    // ✅ SEARCH FILTER
    if (typeof search === "string" && search.trim() !== "") {
      conditions.push({
        name: { $regex: search, $options: "i" },
      });
    }

    const filter = conditions.length > 0 ? { $and: conditions } : {};

    const medicines = await Medicine.find(filter)
      .populate("pharmacy", "name")
      .sort({ createdAt: -1 });

    res.json(medicines);
  } catch (error) {
    console.error(error); // 🔥 VERY IMPORTANT
    res.status(500).json({ message: "Error fetching medicines" });
  }
};

// ✅ UPDATE MEDICINE (ONLY OWNER)
export const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const medicine = await Medicine.findOneAndUpdate(
      {
        _id: id,
        pharmacy: req.user.pharmacyId, // 🔐 ownership check
      },
      req.body,
      { new: true }
    );

    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating medicine" });
  }
};

// ✅ DELETE MEDICINE (ONLY OWNER)
export const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Medicine.findOneAndDelete({
      _id: id,
      pharmacy: req.user.pharmacyId, // 🔐 ownership check
    });

    if (!deleted) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    res.json({ message: "Medicine deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting medicine" });
  }
};