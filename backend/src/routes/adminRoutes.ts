import express from "express";
import { createPharmacyAccount } from "../controllers/adminController";
import { createNotification } from "../controllers/notificationController";
import { protect } from "../middleware/authMiddleware";
import { AuthRequest } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import User from "../models/User";
import Medicine from "../models/Medicine";
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
      const totalMedicines = await Medicine.countDocuments();
      const totalOrders = await Order.countDocuments();
      const lowStock = await Medicine.countDocuments({ stock: { $lt: 10 } });
      const pendingOrders = await Order.countDocuments({ status: "pending" });
      const completedOrders = await Order.countDocuments({ status: "delivered" });

      res.json({
        users: totalUsers,
        pharmacies: totalPharmacies,
        medicines: totalMedicines,
        orders: totalOrders,
        lowStock,
        pendingOrders,
        completedOrders,
      });
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

      // 🔔 NOTIFY USER
      await createNotification(
        user._id.toString(),
        user.isVerified ? "Account Verified" : "Account Unverified",
        user.isVerified
          ? "Your account has been verified by the admin."
          : "Your account verification has been revoked by the admin.",
        "system"
      );

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

      // 🔔 NOTIFY PHARMACY
      await createNotification(
        pharmacy._id.toString(),
        pharmacy.isActive ? "Account Activated" : "Account Deactivated",
        pharmacy.isActive
          ? "Your pharmacy account has been activated by the admin."
          : "Your pharmacy account has been deactivated by the admin.",
        "system"
      );

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
   GET ALL RIDERS
========================= */
router.get(
  "/riders",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const riders = await User.find({ role: "rider" });
      res.json(riders);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   CREATE RIDER ACCOUNT
========================= */
router.post(
  "/create-rider",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);

      const rider = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "rider",
      });

      res.status(201).json(rider);
    } catch (err) {
      console.error("CREATE RIDER ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   ASSIGN RIDER TO ORDER
========================= */
router.put(
  "/orders/:id/assign-rider",
  protect,
  authorize("admin"),
  async (req: AuthRequest, res) => {
    try {
      const { riderId } = req.body;

      const rider = await User.findOne({ _id: riderId, role: "rider" });
      if (!rider) {
        return res.status(404).json({ message: "Rider not found" });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
          rider: riderId,
          deliveryStatus: "assigned",
        },
        { new: true }
      )
        .populate("user", "name email")
        .populate("pharmacy", "name")
        .populate("rider", "name email");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // 🔔 NOTIFY RIDER
      await createNotification(
        riderId,
        "New Delivery Assigned",
        "A new delivery has been assigned to you.",
        "delivery"
      );

      // 🔔 NOTIFY USER
      await createNotification(
        order.user.toString(),
        "Rider Assigned",
        `A rider has been assigned to your delivery.`,
        "delivery"
      );

      // 🔔 SYSTEM LOG FOR ADMIN
      await createNotification(
        req.user!.id,
        "Rider Assigned",
        `Rider ${rider.name} has been assigned to an order.`,
        "system"
      );

      res.json(order);
    } catch (err) {
      console.error("ASSIGN RIDER ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/* =========================
   ORDER STATUS UPDATE
========================= */
router.put(
  "/orders/:id/status",
  protect,
  authorize("admin"),
  async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!order) return res.status(404).json({ message: "Order not found" });

     // 🔔 NOTIFY USER
await createNotification(
  order.user._id.toString(),  // ✅ use ._id not .toString() directly
  "Rider Assigned",
  `A rider has been assigned to your delivery.`,
  "delivery"
);

      res.json(order);
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
   ORDERS
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
        .populate("rider", "name email")
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
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