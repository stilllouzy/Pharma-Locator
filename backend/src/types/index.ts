export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'pharmacy' | 'admin';
  isVerified: boolean;
  pharmacyId?: string;
}

export interface IPharmacy {
  _id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  isActive: boolean;
}

export interface IMedicine {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  pharmacyId: string;
  category: string;
  image: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  pharmacyId: string;
  medicines: { medicineId: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryAddress?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'gcash' | 'pickup';
  paymentStatus: 'pending' | 'paid' | 'failed';
}