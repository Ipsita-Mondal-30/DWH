import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cart } from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cart = await Cart.findOne({ userId }).populate('items.productId');

  interface Product {
    id: string;
    name: string;
    price: number;
    // Add other fields as needed
  }

  interface CartItem {
    product: Product;
    quantity: number;
  }

  const items: CartItem[] = cart?.items.map((item: { productId: Product; quantity: number }) => ({
    product: item.productId as Product,
    quantity: item.quantity,
  })) || [];

  return NextResponse.json({ items });
}

export async function POST(_req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity }: { productId: string; quantity: number } = await _req.json();
  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = await Cart.create({ userId, items: [{ productId, quantity }] });
  } else {
    const item = cart.items.find((item: { productId: Types.ObjectId; quantity: number }) =>
      item.productId.equals(productId)
    );
    if (item) {
      item.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    await cart.save();
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId }: { productId: string } = await req.json();

  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = cart.items.filter((item: { productId: Types.ObjectId }) =>
      !item.productId.equals(productId)
    );
    await cart.save();
  }

  return NextResponse.json({ success: true });
}
