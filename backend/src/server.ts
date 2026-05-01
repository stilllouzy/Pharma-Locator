import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import pharmacyRoutes from "./routes/pharmacyRoutes";
import adminRoutes from "./routes/adminRoutes";
import medicineRoutes from "./routes/medicineRoutes";
import prescriptionRoutes from "./routes/prescriptionRoutes";
import orderRoutes from "./routes/orderRoutes";
import riderRoutes from "./routes/riderRoutes";
import notificationRoutes from "./routes/notificationRoutes"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rider", riderRoutes);
app.use("/api/notification", notificationRoutes);
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err)) ;

app.listen(5000, () => {
  console.log("Server running on port 5000");
});