import { Response } from "express";
import Prescription from "../models/Prescriptions";
import { AuthRequest } from "../middleware/authMiddleware";

// USER: UPLOAD PRESCRIPTION
export const uploadPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { pharmacy, orderId, imageUrl } = req.body;

    const prescription = await Prescription.create({
      user: req.user!.id,
      pharmacy,
      order: orderId,
      imageUrl,
    });

    res.status(201).json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading prescription" });
  }
};

// USER: GET MY PRESCRIPTIONS
export const getMyPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user!.id })
      .populate("pharmacy", "name")
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching prescriptions" });
  }
};

// PHARMACY: GET PRESCRIPTIONS FOR THEIR PHARMACY
export const getPharmacyPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await Prescription.find({
      pharmacy: req.user!.pharmacyId,
    })
      .populate("user", "name email")
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching prescriptions" });
  }
};

// PHARMACY: APPROVE PRESCRIPTION
export const approvePrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findOneAndUpdate(
      {
        _id: id,
        pharmacy: req.user!.pharmacyId,
      },
      { status: "approved" },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving prescription" });
  }
};

// PHARMACY: REJECT PRESCRIPTION
export const rejectPrescription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const prescription = await Prescription.findOneAndUpdate(
      {
        _id: id,
        pharmacy: req.user!.pharmacyId,
      },
      { status: "rejected", rejectionReason },
      { new: true }
    );

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error rejecting prescription" });
  }
};

// ADMIN: GET ALL PRESCRIPTIONS
export const getAllPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("user", "name email")
      .populate("pharmacy", "name")
      .populate("order")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching prescriptions" });
  }
};