// File: /app/api/cart/clear/route.ts (or /pages/api/cart/clear.ts if using pages router)

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Cart } from '@/models/Cart';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    await connectDB();
    
    // Get session to verify authentication
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    console.log('🗑️ Clearing cart for user:', String(userId));

    // Clear the user's cart
    const result = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true, upsert: true } // Create cart if it doesn't exist
    );

    console.log('✅ Cart cleared successfully for user:', String(userId));

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: result
    });

  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}

// Alternative DELETE method
export async function DELETE(_request: NextRequest) {
  return POST(_request); // Reuse the same logic
}