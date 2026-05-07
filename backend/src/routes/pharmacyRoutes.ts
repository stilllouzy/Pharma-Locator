import express from "express";
import {
  createPharmacy,
  getApprovedPharmacies,
  getAllPharmacies,
  approvePharmacy,
} from "../controllers/pharmacyController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import Pharmacy from "../models/Pharmacy";

const router = express.Router();

// USER SIDE (public)
router.get("/", getApprovedPharmacies);

// PHARMACY CREATION
router.post("/", protect, authorize("pharmacy"), createPharmacy);

// ADMIN
router.get("/admin", protect, authorize("admin"), getAllPharmacies);
router.put("/approve/:id", protect, authorize("admin"), approvePharmacy);

// ADMIN: TOGGLE PHARMACY APPROVAL
router.put(
  "/toggle/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const pharmacy = await Pharmacy.findById(req.params.id);
      if (!pharmacy)
        return res.status(404).json({ message: "Pharmacy not found" });

      pharmacy.isApproved = !pharmacy.isApproved;
      await pharmacy.save();

      res.json(pharmacy);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ADMIN: UPDATE PHARMACY LOCATION
router.put(
  "/location/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { lat, lng } = req.body;
      const pharmacy = await Pharmacy.findByIdAndUpdate(
        req.params.id,
        { "location.lat": lat, "location.lng": lng },
        { new: true }
      );
      if (!pharmacy)
        return res.status(404).json({ message: "Pharmacy not found" });

      res.json(pharmacy);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;