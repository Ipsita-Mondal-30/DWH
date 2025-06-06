
// types/cart.ts
export interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  size?: string;
  type?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// For MongoDB document structure
export interface MongoCartItem {
  productId: string;
  quantity: number;
  _id?: string;
}

export interface MongoCart {
  _id: string;
  userId: string;
  items: MongoCartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}