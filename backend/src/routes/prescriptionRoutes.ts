import express from "express";
import {
  uploadPrescription,
  getMyPrescriptions,
  getPharmacyPrescriptions,
  approvePrescription,
  rejectPrescription,
  getAllPrescriptions,
} from "../controllers/prescriptionController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();

// USER
router.post("/", protect, authorize("user"), uploadPrescription);
router.get("/my", protect, authorize("user"), getMyPrescriptions);

// PHARMACY
router.get("/pharmacy", protect, authorize("pharmacy"), getPharmacyPrescriptions);
router.put("/:id/approve", protect, authorize("pharmacy"), approvePrescription);
router.put("/:id/reject", protect, authorize("pharmacy"), rejectPrescription);

// ADMIN
router.get("/", protect, authorize("admin"), getAllPrescriptions);

export default router;