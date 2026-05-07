import express from "express";
import {
  createOrder,
  getUserOrders,
  getPharmacyOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import Order from "../models/Order";

const router = express.Router();

// USER
router.post("/", protect, authorize("user"), createOrder);
router.get("/user", protect, authorize("user"), getUserOrders); // ✅ renamed
router.get("/track/:id", protect, authorize("user"), async (req: any, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate("pharmacy", "name address")
      .populate("rider", "name email")
      .populate("items.medicine", "name price");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PHARMACY
router.get("/pharmacy", protect, authorize("pharmacy"), getPharmacyOrders);
router.put("/:id/status", protect, authorize("pharmacy", "admin"), updateOrderStatus);

export default router;