import express from "express";
import {
  createOrder,
  getUserOrders,
  getPharmacyOrders,
  updateOrderStatus,
  payOrder,
  trackOrder,
} from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import Order from "../models/Order";

const router = express.Router();

// USER
router.post("/", protect, authorize("user"), createOrder);
router.get("/user", protect, authorize("user"), getUserOrders); // ✅ renamed
router.get(
  "/track/:id",
  protect,
  authorize("user"),
  trackOrder
);

// PHARMACY
router.get("/pharmacy", protect, authorize("pharmacy"), getPharmacyOrders);
router.put("/:id/status", protect, authorize("pharmacy", "admin"), updateOrderStatus);
// PAYMENT
router.post(
  "/pay/:id",
  protect,
  authorize("user"),
  payOrder
);
export default router;