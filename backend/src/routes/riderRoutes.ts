import express from "express";
import {
  getMyDeliveries,
  getDeliveryHistory,
  getDeliveryDetails,
  updateDeliveryStatus,
  getRiderDashboard,
} from "../controllers/riderController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();

router.get("/dashboard", protect, authorize("rider"), getRiderDashboard);
router.get("/deliveries", protect, authorize("rider"), getMyDeliveries);
router.get("/history", protect, authorize("rider"), getDeliveryHistory);
router.get("/deliveries/:id", protect, authorize("rider"), getDeliveryDetails);
router.put("/deliveries/:id/status", protect, authorize("rider"), updateDeliveryStatus);

export default router;