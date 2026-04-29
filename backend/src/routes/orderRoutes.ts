import express from "express";
import {
  createOrder,
  getUserOrders,
  getPharmacyOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";

const router = express.Router();

// USER
router.post("/", protect, authorize("user"), createOrder);
router.get("/my-orders", protect, authorize("user"), getUserOrders);

// PHARMACY
router.get("/pharmacy", protect, authorize("pharmacy"), getPharmacyOrders);
router.put("/:id/status", protect, authorize("pharmacy", "admin"), updateOrderStatus);

export default router;