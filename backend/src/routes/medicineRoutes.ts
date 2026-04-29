import express from "express";
import {
  createMedicine,
  getMyMedicines,
  getAllMedicines,
  updateMedicine,
  deleteMedicine,
} from "../controllers/medicineController";

import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();

// 👤 USER SIDE
router.get("/", getAllMedicines);

// 🏥 PHARMACY SIDE
router.post("/", protect, authorize("pharmacy"), createMedicine);
router.get("/my", protect, authorize("pharmacy"), getMyMedicines);
router.put("/:id", protect, authorize("pharmacy"), updateMedicine);
router.delete("/:id", protect, authorize("pharmacy"), deleteMedicine);

export default router;