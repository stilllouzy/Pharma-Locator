import mongoose, { Schema, Document } from "mongoose";

export interface IPharmacy extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contactNumber: string;
  isApproved: boolean;
}

const PharmacySchema: Schema = new Schema(
  {
    name: { type: String, required: true },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: { type: String, required: true },

    location: {
      lat: { type: Number },
      lng: { type: Number },
    },

    contactNumber: String,

    isApproved: {
      type: Boolean,
      default: false, // ❗ important for approval system
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPharmacy>("Pharmacy", PharmacySchema);