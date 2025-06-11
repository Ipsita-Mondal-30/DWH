import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cart } from '@/models/Cart';
import { Product } from '@/models/Product';
import { Namkeen } from '@/models/Namkeen';
// Add this import for your Box model
import { Box } from '@/models/Box'; // Make sure this path is correct
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface CartDbItem {
  productId: Types.ObjectId;
  quantity: number;
  selectedPricing?: Pricing;
  _id?: string;
}

interface ProductData {
  _id: string;
  name: string;
  pricing?: Pricing[];
  image?: string;
  type?: string;
  price?: number; // Add price field for Box items
}

interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image?: string;
    size?: string;
    type?: string;
    pricing?: Pricing[];
  };
  quantity: number;
  selectedPricing?: Pricing;
}

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Manually populate items by fetching from Product, Namkeen, and Box collections
    const populatedItems: CartItem[] = [];

    for (const item of cart.items) {
      let productData: ProductData | null = null;

      // Try to find in Product collection first
      productData = await Product.findById(item.productId);
      
      // If not found in Product, try Namkeen collection
      if (!productData) {
        productData = await Namkeen.findById(item.productId);
      }

      // If not found in Namkeen, try Box collection
      if (!productData) {
        productData = await Box.findById(item.productId);
      }

      if (productData) {
        console.log('Product data found:', { 
          id: productData._id, 
          name: productData.name, 
          pricing: productData.pricing,
          price: productData.price,
          selectedPricing: item.selectedPricing 
        }); // Debug log
        
        const cartItem: CartItem = {
          product: {
            _id: productData._id.toString(),
            name: productData.name,
            // For Box items, use the direct price or selectedPricing price
            price: item.selectedPricing?.price || productData.price || (productData.pricing?.[0]?.price ?? 0),
            image: productData.image,
            size: item.selectedPricing 
              ? `${item.selectedPricing.quantity}${item.selectedPricing.unit}`
              : undefined,
            type: productData.type || 'box', // Default to 'box' if no type specified
            pricing: productData.pricing, // This might be undefined for Box items
          },
          quantity: item.quantity,
          selectedPricing: item.selectedPricing,
        };
        populatedItems.push(cartItem);
      } else {
        console.log('Product not found for ID:', item.productId); // Debug log
      }
    }

    console.log('Final populated items:', populatedItems.length); // Debug log
    return NextResponse.json({ items: populatedItems });
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

    const { 
      productId, 
      quantity, 
      selectedPricing 
    }: { 
      productId: string; 
      quantity: number; 
      selectedPricing?: Pricing;
    } = await req.json();
    
    console.log('POST request received:', { productId, quantity, selectedPricing }); // Debug log
    
    if (!productId || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!Types.ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    // Verify the product exists in one of the collections
    let productExists = false;
    
    // Check in Product collection
    const productInProducts = await Product.findById(productId);
    if (productInProducts) productExists = true;
    
    // Check in Namkeen collection if not found in Products
    if (!productExists) {
      const productInNamkeens = await Namkeen.findById(productId);
      if (productInNamkeens) productExists = true;
    }
    
    // Check in Box collection if not found in previous collections
    if (!productExists) {
      const productInBoxes = await Box.findById(productId);
      if (productInBoxes) productExists = true;
    }

    if (!productExists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let cart = await Cart.findOne({ userId });

    const cartItem: {
      productId: Types.ObjectId;
      quantity: number;
      selectedPricing?: Pricing;
    } = {
      productId: new Types.ObjectId(productId),
      quantity,
    };
    
    // Add pricing information if provided
    if (selectedPricing) {
      cartItem.selectedPricing = {
        quantity: selectedPricing.quantity,
        unit: selectedPricing.unit,
        price: selectedPricing.price
      };
      console.log('Adding pricing info:', cartItem.selectedPricing); // Debug log
    }

    if (!cart) {
      console.log('Creating new cart'); // Debug log
      cart = await Cart.create({ 
        userId, 
        items: [cartItem] 
      });
    } else {
      console.log('Existing cart found, checking for duplicate items'); // Debug log
      const existingItemIndex = cart.items.findIndex((item: CartDbItem) => {
        const sameProduct = item.productId.equals(productId);
        
        if (!selectedPricing && !item.selectedPricing) {
          return sameProduct; // Both have no pricing
        }
        
        if (selectedPricing && item.selectedPricing) {
          return sameProduct &&
            item.selectedPricing.quantity === selectedPricing.quantity &&
            item.selectedPricing.unit === selectedPricing.unit &&
            item.selectedPricing.price === selectedPricing.price;
        }
        
        return false; // One has pricing, other doesn't
      });

      console.log('Existing item index:', existingItemIndex); // Debug log

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        console.log('Updated existing item quantity'); // Debug log
      } else {
        // Add new item
        cart.items.push(cartItem);
        console.log('Added new item to cart'); // Debug log
      }
      
      await cart.save();
    }

    console.log('Cart operation successful'); // Debug log
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
    
    console.log('PUT request:', { productId, quantity }); // Debug log
    
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

    console.log('Found item at index:', itemIndex); // Debug log

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found in cart' }, { status: 404 });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
      console.log('Removed item from cart'); // Debug log
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
      console.log('Updated quantity to:', quantity); // Debug log
    }

    await cart.save();
    console.log('Cart saved successfully'); // Debug log
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