import mongoose, { Schema, Document } from "mongoose";

export interface IMedicine extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  pharmacy: mongoose.Types.ObjectId;
}

const MedicineSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: String,

    // 🔗 link to pharmacy
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicine>("Medicine", MedicineSchema);