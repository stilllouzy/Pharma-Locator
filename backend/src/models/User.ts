import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "pharmacy" | "admin";
  pharmacyId?: mongoose.Types.ObjectId;
  address?: string;
  contactNumber?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "pharmacy", "admin"],
      default: "user",
    },

    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
    },

    address: String,

    contactNumber: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);