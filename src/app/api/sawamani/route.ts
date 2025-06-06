import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Sawamani from '@/models/Sawamani';
import { connectDB } from '@/lib/db';


// GET request - Fetch all Sawamani orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Optional filters
    const phoneNumber = searchParams.get('phoneNumber');
    const itemType = searchParams.get('itemType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter object
    const filter: any = {};
    
    if (phoneNumber) {
      filter.phoneNumber = phoneNumber;
    }
    
    if (itemType) {
      filter['item.type'] = itemType;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    const orders = await Sawamani.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Sawamani.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('GET /api/sawamani error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST request - Create new Sawamani order
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'phoneNumber', 'address', 'item', 'date', 'packing'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate item structure
    if (!body.item.type || !body.item.variant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Item must include both type and variant',
        },
        { status: 400 }
      );
    }

    // Create new order
    const newOrder = new Sawamani({
      name: body.name,
      phoneNumber: body.phoneNumber,
      address: body.address,
      item: {
        type: body.item.type,
        variant: body.item.variant,
      },
      date: new Date(body.date),
      packing: body.packing,
    });

    const savedOrder = await newOrder.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        data: savedOrder,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST /api/sawamani error:', error);

    // Handle validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate entry',
          message: 'An order with this information already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}