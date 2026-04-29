import express from "express";
import { createPharmacyAccount } from "../controllers/adminController";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import User from "../models/User";
import Order from "../models/Order";
const router = express.Router();

/* =========================
   CREATE PHARMACY ACCOUNT
========================= */
router.post(
  "/create-pharmacy",
  protect,
  authorize("admin"),
  createPharmacyAccount
);

/* =========================
   DASHBOARD
========================= */
router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({ role: "user" });
      const totalPharmacies = await User.countDocuments({ role: "pharmacy" });

      res.json({ totalUsers, totalPharmacies });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   GET ALL USERS
========================= */
router.get(
  "/users",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const search = (req.query.search as string) || "";

      const users = await User.find({
        name: { $regex: search, $options: "i" },
      });

      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   VERIFY USER
========================= */
router.put(
  "/users/:id/verify",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) return res.status(404).json({ message: "User not found" });

      user.isVerified = !user.isVerified;
      await user.save();

      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   DELETE USER
========================= */
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   GET ALL PHARMACIES
========================= */
router.get(
  "/pharmacies",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const search = (req.query.search as string) || "";

      const pharmacies = await User.find({
        role: "pharmacy",
        name: { $regex: search, $options: "i" },
      });

      res.json(pharmacies);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   TOGGLE PHARMACY STATUS
========================= */
router.put(
  "/pharmacies/:id/toggle",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const pharmacy = await User.findById(req.params.id);

      if (!pharmacy)
        return res.status(404).json({ message: "Pharmacy not found" });

      pharmacy.isActive = !pharmacy.isActive;
      await pharmacy.save();

      res.json(pharmacy);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   DELETE PHARMACY
========================= */
router.delete(
  "/pharmacies/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "Pharmacy deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   MEDICINES (TEMP)
========================= */
router.get(
  "/medicines",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.json([]);
  }
);

/* =========================
   ORDERS (TEMP)
========================= */
router.get(
  "/orders",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = status ? { status } : {};
      const orders = await Order.find(filter)
        .populate("user", "name email")    
        .populate("pharmacy", "name")       
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);
/* =========================
   NOTIFICATIONS (TEMP)
========================= */
router.get(
  "/notifications",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.json([]);
  }
);
/* =========================
   ANALYTICS (TEMP)
========================= */
router.get(
  "/analytics",
  protect,
  authorize("admin"),
  async (req, res) => {
    res.json({});
  }
);
export default router;