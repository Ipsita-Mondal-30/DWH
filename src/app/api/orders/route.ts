import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; // Adjust import path as needed
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '@/models/Order'; // Adjust import path
import { Cart } from '@/models/Cart'; // Adjust import path
import { Product } from '@/models/Product'; // Adjust import path
import { Namkeen } from '@/models/Namkeen'; // Add this import
import { Box } from '@/models/Box'; // Add this import
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust import path

// Helper function to find product by ID across all collections
async function findProductById(productId: string) {
  // Try finding in Product collection first
  let product = await Product.findById(productId);
  if (product) {
    return { product, type: 'product' };
  }

  // Try finding in Namkeen collection
  product = await Namkeen.findById(productId);
  if (product) {
    return { product, type: 'namkeen' };
  }

  // Try finding in Box collection
  product = await Box.findById(productId);
  if (product) {
    return { product, type: 'box' };
  }

  return null;
}

// POST: Create a new order (Checkout)
// POST: Create a new order (Checkout) - IMPROVED VERSION
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      userEmail,
      shippingAddress,
      paymentMethod,
      notes,
      cartItems, // Optional: pass cart items directly, or fetch from cart
      totals // ✅ NEW: Get totals from the request
    } = body;

    console.log('📋 Received order request:', {
      userEmail,
      paymentMethod,
      cartItemsCount: cartItems?.length,
      totalsProvided: !!totals,
      totals: totals
    });

    // Get userId from session instead of request body
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Validate required fields
    if (!userId || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: user session, shippingAddress, or paymentMethod' },
        { status: 400 }
      );
    }

    // Validate payment method
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Get cart items (either from request body or fetch from cart)
    let items;
    let shouldClearCart = false; // Flag to determine if we should clear cart
    
    if (cartItems && cartItems.length > 0) {
      items = cartItems;
      shouldClearCart = true; // Clear cart when using passed cart items
    } else {
      // Fetch from user's cart
      const cart = await Cart.findOne({ userId }).populate('items.productId');
      if (!cart || cart.items.length === 0) {
        return NextResponse.json(
          { error: 'Cart is empty' },
          { status: 400 }
        );
      }
      items = cart.items;
      shouldClearCart = true; // Clear cart when using cart from database
    }

    // Process cart items and prepare order items
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      // Find product across all collections
      let productData;
      let productType;

      if (item.productId) {
        // If cart item, fetch product details from any collection
        const result = await findProductById(item.productId);
        if (!result) {
          return NextResponse.json(
            { error: `Product not found for item with ID: ${item.productId}` },
            { status: 404 }
          );
        }
        productData = result.product;
        productType = result.type;
      } else {
        // If direct cart items passed, assume product details are included
        productData = item.product;
        // Try to determine type from the product structure
        if (productData.pricing && Array.isArray(productData.pricing)) {
          productType = 'namkeen';
        } else if (productData.pricing && !Array.isArray(productData.pricing)) {
          productType = 'product';
        } else {
          productType = 'box';
        }
      }

      if (!productData) {
        return NextResponse.json(
          { error: `Product data not found for item` },
          { status: 404 }
        );
      }

      console.log('Processing item:', {
        productId: productData._id,
        productName: productData.name,
        productType,
        selectedPricing: item.selectedPricing,
        hasProductPricing: !!productData.pricing
      });

      // Handle pricing based on product type
      let selectedPricing;
      let itemPrice;

      if (productType === 'box') {
        // Box products have simple price structure
        selectedPricing = {
          quantity: 1,
          unit: 'piece',
          price: productData.price
        };
        itemPrice = productData.price;
      } else if (productType === 'namkeen') {
        // Namkeen products have pricing array
        if (item.selectedPricing) {
          selectedPricing = item.selectedPricing;
          itemPrice = selectedPricing.price;
        } else if (productData.pricing && productData.pricing.length > 0) {
          // Use first pricing option as default
          selectedPricing = productData.pricing[0];
          itemPrice = selectedPricing.price;
        } else {
          return NextResponse.json(
            { error: `No pricing found for namkeen: ${productData.name}` },
            { status: 400 }
          );
        }
      } else {
        // Product type - handle both simple price and pricing array
        if (item.selectedPricing) {
          selectedPricing = item.selectedPricing;
          itemPrice = selectedPricing.price;
        } else if (productData.pricing && Array.isArray(productData.pricing) && productData.pricing.length > 0) {
          // Use first pricing option as default
          selectedPricing = productData.pricing[0];
          itemPrice = selectedPricing.price;
        } else if (productData.price) {
          // Simple price structure
          selectedPricing = {
            quantity: 1,
            unit: 'piece',
            price: productData.price
          };
          itemPrice = productData.price;
        } else {
          return NextResponse.json(
            { error: `No pricing found for product: ${productData.name}` },
            { status: 400 }
          );
        }
      }

      // Calculate item total
      const itemTotal = itemPrice * item.quantity;
      
      orderItems.push({
        productId: productData._id,
        productName: productData.name,
        productImage: productData.image,
        productType: productType, // Add product type to order item
        quantity: item.quantity,
        selectedPricing: selectedPricing,
        itemTotal: itemTotal
      });

      calculatedSubtotal += itemTotal;
      
      console.log('Added order item:', {
        productName: productData.name,
        productType,
        quantity: item.quantity,
        itemPrice,
        itemTotal,
        runningSubtotal: calculatedSubtotal
      });
    }

    // ✅ USE TOTALS FROM REQUEST IF PROVIDED, OTHERWISE CALCULATE
    let finalTotals;
    
    if (totals && totals.totalAmount) {
      // Use the totals passed from the frontend (UPI Payment component)
      finalTotals = {
        subtotal: totals.subtotal,
        shippingCost: totals.shippingCost,
        tax: totals.tax,
        totalAmount: totals.totalAmount
      };
      
      console.log('💰 Using totals from request:', finalTotals);
      
      // Validate that calculated subtotal matches passed subtotal (for security)
      const subtotalDifference = Math.abs(calculatedSubtotal - totals.subtotal);
      if (subtotalDifference > 0.01) { // Allow small rounding differences
        console.warn('⚠️ Subtotal mismatch:', {
          calculated: calculatedSubtotal,
          provided: totals.subtotal,
          difference: subtotalDifference
        });
        // You can choose to reject the order or use calculated values
        // For now, we'll use the provided totals but log the discrepancy
      }
    } else {
      // Fallback: Calculate totals if not provided
      console.log('💰 Calculating totals (fallback)');
      const subtotal = calculatedSubtotal;
      const shippingCost = subtotal >= 1000 ? 0 : 59; // Updated shipping logic to match frontend
      const taxRate = 0.18; // 18% GST
      const tax = Math.round(subtotal * taxRate);
      const totalAmount = subtotal + shippingCost + tax;
      
      finalTotals = {
        subtotal,
        shippingCost,
        tax,
        totalAmount
      };
      
      console.log('💰 Calculated totals (fallback):', finalTotals);
    }

    // Create order
    const order = new Order({
      userId,
      userEmail,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal: finalTotals.subtotal,
      shippingCost: finalTotals.shippingCost,
      tax: finalTotals.tax,
      totalAmount: finalTotals.totalAmount, // ✅ Use the correct total amount
      notes,
      orderStatus: OrderStatus.Confirmed,
      paymentStatus: paymentMethod === PaymentMethod.CashOnDelivery ? PaymentStatus.Pending : PaymentStatus.Pending,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Generate orderId manually before saving
    const count = await Order.countDocuments();
    const year = new Date().getFullYear();
    order.orderId = `ORD-${year}-${String(count + 1).padStart(4, '0')}`;

    console.log('💾 Saving order to database:', {
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      paymentMethod: order.paymentMethod,
      itemsCount: order.items.length
    });

    await order.save();

    // ✅ IMPROVED: Clear user's cart after successful order - ALWAYS CLEAR
    if (shouldClearCart) {
      try {
        console.log('🗑️ Clearing cart for user:', userId);
        const clearResult = await Cart.findOneAndUpdate(
          { userId },
          { $set: { items: [] } },
          { new: true, upsert: true } // Create cart if it doesn't exist
        );
        console.log('✅ Cart cleared successfully:', clearResult ? 'Cart found and cleared' : 'Cart not found but will be empty');
      } catch (cartError) {
        console.error('⚠️ Error clearing cart (non-critical):', cartError);
        // Don't fail the order if cart clearing fails
      }
    }

    console.log('✅ Order saved successfully:', {
      orderId: order.orderId,
      totalAmount: order.totalAmount
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery
      }
    }, { status: 201 });

  } catch (error) {
    console.error('💥 Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET: Fetch orders (for admin or user)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get session to verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log('GET Orders - Session user ID:', session.user?.id);
    console.log('GET Orders - Requested user ID:', requestedUserId);
    console.log('GET Orders - Is admin:', isAdmin);

    const query: Record<string, unknown> = {};

    // Security: Users can only see their own orders unless they're admin
    if (isAdmin) {
      // Admin can see all orders or filter by specific user
      if (requestedUserId) {
        query.userId = requestedUserId;
      }
    } else {
      // Regular users can only see their own orders
      // Ignore the requestedUserId and use session user ID
      query.userId = session.user?.id;
    }

    console.log('GET Orders - Final query:', query);

    // Filter by status if provided
    if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
      query.orderStatus = status;
    }

    // Fetch orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // Latest first
      .skip(skip)
      .limit(limit)
      .populate('items.productId', 'name image'); // Populate product details if needed

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalOrders / limit);

    console.log('GET Orders - Found orders:', orders.length);

    // If admin request, include additional stats
    let stats = {};
    if (isAdmin) {
      const [
        totalOrdersCount,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: OrderStatus.Confirmed }),
        Order.countDocuments({ orderStatus: OrderStatus.Delivered }),
        Order.countDocuments({ orderStatus: OrderStatus.Cancelled }),
        Order.aggregate([
          { $match: { orderStatus: { $ne: OrderStatus.Cancelled } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ])
      ]);

      stats = {
        totalOrders: totalOrdersCount,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      };
    }

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      ...(isAdmin && { stats })
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// PUT: Update order status (for admin)
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add admin check here if you have role-based access
    // const isAdmin = session.user?.role === 'admin';
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Forbidden - Admin access required' },
    //     { status: 403 }
    //   );
    // }
    
    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, adminNotes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    interface OrderUpdateData {
      orderStatus?: OrderStatus;
      deliveredAt?: Date;
      cancelledAt?: Date;
      paymentStatus?: PaymentStatus;
      adminNotes?: string;
    }
    const updateData: OrderUpdateData = {};
    
    
    if (orderStatus && Object.values(OrderStatus).includes(orderStatus)) {
      updateData.orderStatus = orderStatus;
      
      // Set delivered date if status is delivered
      if (orderStatus === OrderStatus.Delivered) {
        updateData.deliveredAt = new Date();
      }
      
      // Set cancelled date if status is cancelled
      if (orderStatus === OrderStatus.Cancelled) {
        updateData.cancelledAt = new Date();
      }
    }

    if (paymentStatus && Object.values(PaymentStatus).includes(paymentStatus)) {
      updateData.paymentStatus = paymentStatus;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel an order
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    // Get session to verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const requestedUserId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';
    
    const body = await request.json().catch(() => ({}));
    const { cancellationReason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    console.log('DELETE Order - Session user ID:', session.user?.id);
    console.log('DELETE Order - Requested user ID:', requestedUserId);
    console.log('DELETE Order - Is admin:', isAdmin);

    // Build query - security check
    interface OrderQuery {
      orderId: string;
      userId?: string;
    }
    const query: OrderQuery = { orderId };
    
    if (isAdmin) {
      // Admin can cancel any order, optionally filter by userId
      if (requestedUserId) {
        query.userId = requestedUserId;
      }
    } else {
      // Regular users can only cancel their own orders
      query.userId = session.user?.id;
    }

    console.log('DELETE Order - Final query:', query);

    // Find the order first
    const order = await Order.findOne(query);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or you do not have permission to cancel this order' },
        { status: 404 }
      );
    }

    // Check if order can be cancelled
    if (order.orderStatus === OrderStatus.Delivered) {
      return NextResponse.json(
        { error: 'Cannot cancel a delivered order' },
        { status: 400 }
      );
    }

    if (order.orderStatus === OrderStatus.Cancelled) {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      );
    }

    // Update order to cancelled
    const updatedOrder = await Order.findOneAndUpdate(
      query,
      {
        orderStatus: OrderStatus.Cancelled,
        cancelledAt: new Date(),
        cancellationReason: cancellationReason || 'Cancelled by user',
        paymentStatus: order.paymentStatus === PaymentStatus.Paid ? PaymentStatus.Pending : order.paymentStatus // Keep paid status for refund processing
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        orderId: updatedOrder.orderId,
        orderStatus: updatedOrder.orderStatus,
        cancelledAt: updatedOrder.cancelledAt,
        cancellationReason: updatedOrder.cancellationReason
      }
    });

  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}