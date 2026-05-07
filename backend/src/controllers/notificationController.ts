import { Response } from "express";
import Notification from "../models/Notification";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE NOTIFICATION (internal helper function)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "order" | "prescription" | "delivery" | "system"
) => {
  try {
    await Notification.create({ user: userId, title, message, type });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// GET MY NOTIFICATIONS
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// MARK AS READ
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, user: req.user!.id },
      { isRead: true },
      { new: true }
    );

    res.json({ message: "Marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking notification" });
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { user: req.user!.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking all notifications" });
  }
};

// DELETE NOTIFICATION
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await Notification.findOneAndDelete({ _id: id, user: req.user!.id });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};

// GET UNREAD COUNT
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user!.id,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching unread count" });
  }
};

// ADMIN: GET ALL NOTIFICATIONS
export const getAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await Notification.find({ type: "system" }) // ✅ only system notifications
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching all notifications" });
  }
};