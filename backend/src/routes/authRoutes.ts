import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import User from '../models/User';

const router = Router();

router.post('/register', register);
router.post('/login', login);
// GET CURRENT USER
router.get("/me", protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE CURRENT USER
router.put("/me", protect, async (req: any, res) => {
  try {
    const { name, email, password, contactNumber, address } = req.body;

    const updateData: any = {};

    // only update fields that were sent
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (address) updateData.address = address;

    // hash password if provided
    if (password) {
      const bcrypt = await import("bcryptjs");
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
export default router;