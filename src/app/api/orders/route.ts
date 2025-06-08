import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '@/models/Order'; // Adjust import path
import { Cart } from '@/models/Cart'; // Adjust import path
import { Product } from '@/models/Product'; // Adjust import path

// POST: Create a new order (Checkout)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      userId,
      userEmail,
      shippingAddress,
      paymentMethod,
      notes,
      cartItems // Optional: pass cart items directly, or fetch from cart
    } = body;

    // Validate required fields
    if (!userId || !shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, shippingAddress, or paymentMethod' },
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
    if (cartItems && cartItems.length > 0) {
      items = cartItems;
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
    }

    // Process cart items and calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      // If cart item, fetch product details
      let product;
      if (item.productId) {
        product = await Product.findById(item.productId);
      } else {
        // If direct cart items passed, assume product details are included
        product = item.product;
      }

      if (!product) {
        return NextResponse.json(
          { error: `Product not found for item` },
          { status: 404 }
        );
      }

      // Validate selected pricing
      const selectedPricing = item.selectedPricing;
      if (!selectedPricing) {
        return NextResponse.json(
          { error: `Selected pricing not found for product: ${product.name}` },
          { status: 400 }
        );
      }

      // Calculate item total
      const itemTotal = selectedPricing.price * item.quantity;
      
      orderItems.push({
        productId: product._id,
        productName: product.name,
        productImage: product.image,
        quantity: item.quantity,
        selectedPricing: selectedPricing,
        itemTotal: itemTotal
      });

      subtotal += itemTotal;
    }

    // Calculate shipping and tax (you can customize these calculations)
    const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const taxRate = 0.18; // 18% GST
    const tax = Math.round(subtotal * taxRate);
    const totalAmount = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      userId,
      userEmail,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      notes,
      orderStatus: OrderStatus.Confirmed,
      paymentStatus: paymentMethod === PaymentMethod.CashOnDelivery ? PaymentStatus.Pending : PaymentStatus.Pending,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    // Clear user's cart after successful order
    if (!cartItems) {
      await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );
    }

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
    console.error('Error creating order:', error);
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
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let query: any = {};
    
    // If not admin request, filter by userId
    if (!isAdmin && userId) {
      query.userId = userId;
    }

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
    
    const body = await request.json();
    const { orderId, orderStatus, paymentStatus, adminNotes, trackingInfo } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    
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
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const userId = searchParams.get('userId');
    const isAdmin = searchParams.get('admin') === 'true';
    
    const body = await request.json().catch(() => ({}));
    const { cancellationReason } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Build query - if not admin, must match userId
    let query: any = { orderId };
    if (!isAdmin && userId) {
      query.userId = userId;
    }

    // Find the order first
    const order = await Order.findOne(query);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
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