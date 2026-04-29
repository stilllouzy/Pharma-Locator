import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  medicine: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  pharmacy: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  paymentStatus: "unpaid" | "paid" | "refunded";
  status: "pending" | "preparing" | "delivered" | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    paymentStatus: {
  type: String,
  enum: ["unpaid", "paid", "refunded"],
  default: "unpaid",
},
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "preparing", "delivered", "cancelled"],
      default: "pending",
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "delivery"],
      required: true,
    },
    deliveryAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);