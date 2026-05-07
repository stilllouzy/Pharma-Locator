import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  medicine: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  pharmacy: mongoose.Types.ObjectId;
  rider: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  paymentMethod: "gcash";
  paymentStatus: "unpaid" | "paid" | "refunded";
  referenceNumber?: string;
  status: "pending" | "preparing" | "delivered" | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  deliveryStatus: "unassigned"| "assigned"| "picked_up"| "on_the_way"| "delivered";
  deliveryAddress?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    rider: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
    items: [
      {
        medicine: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ], 
    paymentMethod: {
  type: String,
  enum: ["gcash"],
  default: "gcash",
},
    paymentStatus: {
  type: String,
  enum: ["unpaid", "paid", "refunded"],
  default: "unpaid",
},
referenceNumber: {
  type: String,
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
    deliveryStatus: {
  type: String,
  enum: ["unassigned", "assigned", "picked_up", "on_the_way", "delivered"],
  default: "unassigned",
},
    deliveryAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);