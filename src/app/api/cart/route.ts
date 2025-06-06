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
    _id: string;
    name: string;
    price: number;
    image?: string;
    type?: string;
  }

  interface CartItem {
    product: Product;
    quantity: number;
  }

  const items: CartItem[] = cart?.items.map((item: { productId: Product; quantity: number }) => ({
    product: {
      _id: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      type: item.productId.type,
    },
    quantity: item.quantity,
  })) || [];

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity }: { productId: string; quantity: number } = await req.json();
  
  if (!productId || quantity < 1) {
    return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
  }

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

  return NextResponse.json({ success: true, message: 'Item added to cart' });
}

export async function PUT(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId, quantity }: { productId: string; quantity: number } = await req.json();
  
  if (!productId || quantity < 0) {
    return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
  }

  const cart = await Cart.findOne({ userId });
  
  if (!cart) {
    return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
  }

  const item = cart.items.find((item: { productId: Types.ObjectId; quantity: number }) =>
    item.productId.equals(productId)
  );

  if (!item) {
    return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    cart.items = cart.items.filter((item: { productId: Types.ObjectId }) =>
      !item.productId.equals(productId)
    );
  } else {
    // Update quantity
    item.quantity = quantity;
  }

  await cart.save();
  return NextResponse.json({ success: true, message: 'Cart updated successfully' });
}

export async function DELETE(req: Request) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { productId }: { productId: string } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  const cart = await Cart.findOne({ userId });
  if (cart) {
    cart.items = cart.items.filter((item: { productId: Types.ObjectId }) =>
      !item.productId.equals(productId)
    );
    await cart.save();
  }

  return NextResponse.json({ success: true, message: 'Item removed from cart' });
}