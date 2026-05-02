import { Response } from "express";
import Order from "../models/Order";
import { AuthRequest } from "../middleware/authMiddleware";

// GET ASSIGNED DELIVERIES (active)
export const getMyDeliveries = async (req: AuthRequest, res: Response) => {
  try {

    const orders = await Order.find({
      rider: req.user!.id,
      deliveryStatus: { $in: ["assigned", "picked_up", "on_the_way"] },
    })
      .populate("user", "name email")
      .populate("pharmacy", "name address")
      .populate("items.medicine", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching deliveries" });
  }
};

// GET DELIVERY HISTORY (completed/cancelled)
export const getDeliveryHistory = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({
      rider: req.user!.id,
      deliveryStatus: { $in: ["delivered"] },
    })
      .populate("user", "name email")
      .populate("pharmacy", "name address")
      .populate("items.medicine", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching delivery history" });
  }
};

// GET SINGLE DELIVERY DETAILS
export const getDeliveryDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      rider: req.user!.id, // 🔐 only the assigned rider can view
    })
      .populate("user", "name email")
      .populate("pharmacy", "name address")
      .populate("items.medicine", "name price");

    if (!order) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching delivery details" });
  }
};

// UPDATE DELIVERY STATUS
export const updateDeliveryStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const order = await Order.findOne({
      _id: id,
      rider: req.user!.id, // 🔐 only assigned rider can update
    });

    if (!order) {
      return res.status(404).json({ message: "Delivery not found" });
    }

    order.deliveryStatus = deliveryStatus;

    // 🔗 sync status with deliveryStatus
    if (deliveryStatus === "delivered") {
      order.status = "delivered";
    }

    await order.save();

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating delivery status" });
  }
};

// GET DASHBOARD STATS
export const getRiderDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const assigned = await Order.countDocuments({
      rider: req.user!.id,
      deliveryStatus: { $in: ["assigned", "picked_up", "on_the_way"] },
    });

    const completedToday = await Order.countDocuments({
      rider: req.user!.id,
      deliveryStatus: "delivered",
      updatedAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)), // start of today
      },
    });

    const cancelled = await Order.countDocuments({
      rider: req.user!.id,
      status: "cancelled",
    });

    res.json({ assigned, completedToday, cancelled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching dashboard" });
  }
};