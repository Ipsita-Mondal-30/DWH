import { Schema, model, models } from 'mongoose';

export interface IBox {
  _id?: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

const BoxSchema = new Schema<IBox>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true }
}, {
  timestamps: true
});
interface Box {
    _id?: string;
    name: string;
    description: string;
    image: string;
    price: number;
  }

export const Box = models.Box || model<IBox>('Box', BoxSchema);
