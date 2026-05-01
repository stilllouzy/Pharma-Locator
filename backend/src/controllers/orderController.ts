import { Response } from "express";
import Order from "../models/Order";
import Medicine from "../models/Medicine";
import { AuthRequest } from "../middleware/authMiddleware";
import { createNotification } from "./notificationController";

// CREATE ORDER (Checkout)
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, deliveryMethod, deliveryAddress } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) return res.status(404).json({ message: "Medicine not found" });

      if (medicine.stock < item.quantity)
        return res.status(400).json({ message: `Not enough stock for ${medicine.name}` });

      medicine.stock -= item.quantity;
      await medicine.save();

      totalPrice += medicine.price * item.quantity;
      orderItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price: medicine.price,
      });
    }

    const pharmacyId = (await Medicine.findById(items[0].medicine))!.pharmacy;

    const order = await Order.create({
      user: req.user!.id,
      pharmacy: pharmacyId,
      items: orderItems,
      totalPrice,
      deliveryMethod,
      deliveryAddress,
    });

    // 🔔 NOTIFY USER
    await createNotification(
      req.user!.id,
      "Order Placed",
      "Your order has been placed successfully.",
      "order"
    );

    // 🔔 NOTIFY PHARMACY
    await createNotification(
      pharmacyId.toString(),
      "New Order",
      "A new order has been placed.",
      "order"
    );

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating order" });
  }
};

// GET USER ORDERS
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user!.id })
      .populate("items.medicine", "name price")
      .populate("pharmacy", "name");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// GET PHARMACY ORDERS
export const getPharmacyOrders = async (req: AuthRequest, res: Response) => {
  try {
    console.log("pharmacyId from token:", req.user!.pharmacyId);
    console.log("user id:", req.user!.id);

    const orders = await Order.find({ pharmacy: req.user!.pharmacyId })
      .populate("items.medicine", "name price")
      .populate("user", "name email");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pharmacy orders" });
  }
};

// UPDATE ORDER STATUS (Admin or Pharmacy)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    // 🔔 NOTIFY USER about status change
    if (order) {
      await createNotification(
        order.user.toString(),
        "Order Status Updated",
        `Your order status has been updated to: ${status}`,
        "order"
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order" });
  }
};