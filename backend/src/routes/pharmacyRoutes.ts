import express from "express";
import {
  createPharmacy,
  getApprovedPharmacies,
  getAllPharmacies,
  approvePharmacy,
} from "../controllers/pharmacyController";

import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();

// USER SIDE (public)
router.get("/", getApprovedPharmacies);

// PHARMACY CREATION
router.post("/", protect, authorize("pharmacy"), createPharmacy);

// ADMIN
router.get("/admin", protect, authorize("admin"), getAllPharmacies);
router.put("/approve/:id", protect, authorize("admin"), approvePharmacy);

export default router;