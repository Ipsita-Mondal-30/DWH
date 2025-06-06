import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cart } from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

interface CartDbItem {
  productId: Types.ObjectId;
  quantity: number;
  _id?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  size?: string;
  type?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface PopulatedCartItem {
  productId: Product;
  quantity: number;
  _id?: string;
}

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Transform the cart items to match the expected format
    const items: CartItem[] = cart.items
      .filter((item: PopulatedCartItem) => item.productId) // Filter out items with null productId
      .map((item: PopulatedCartItem) => ({
        product: {
          _id: item.productId._id.toString(),
          name: item.productId.name,
          price: item.productId.price,
          originalPrice: item.productId.originalPrice,
          image: item.productId.image,
          size: item.productId.size,
          type: item.productId.type,
        },
        quantity: item.quantity,
      }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity }: { productId: string; quantity: number } = await req.json();
    
    if (!productId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ 
        userId, 
        items: [{ productId: new Types.ObjectId(productId), quantity }] 
      });
    } else {
      const existingItemIndex = cart.items.findIndex((item: CartDbItem) =>
        item.productId.equals(productId)
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId: new Types.ObjectId(productId), quantity });
      }
      
      await cart.save();
    }

    return NextResponse.json({ success: true, message: 'Item added to cart' });
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity }: { productId: string; quantity: number } = await req.json();
    
    if (!productId || quantity < 0) {
      return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex((item: CartDbItem) =>
      item.productId.equals(productId)
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    return NextResponse.json({ success: true, message: 'Cart updated successfully' });
  } catch (error) {
    console.error('PUT /api/cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId }: { productId: string } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const cart = await Cart.findOne({ userId });
    
    if (cart) {
      const itemIndex = cart.items.findIndex((item: CartDbItem) =>
        item.productId.equals(productId)
      );

      if (itemIndex >= 0) {
        cart.items.splice(itemIndex, 1);
        await cart.save();
      }
    }

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}