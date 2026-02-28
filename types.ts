export enum UserRole {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits: number;
}

export interface MeeshoCategory {
  id: string;
  name: string;
}

export interface OptimizeResult {
  variantId: string;
  imageUrl: string;
  shippingCharge: number;
  gst: number;
  totalCost: number;
  transferPrice: number;
}
