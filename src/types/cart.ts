import type { IProduct } from "../models/Product";

export interface CartItem {
  product: IProduct;
  quantity: number;
}
