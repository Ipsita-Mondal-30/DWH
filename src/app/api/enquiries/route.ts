import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enquiry from '@/models/Enquiry';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const userData = rateLimitStore.get(ip)!;
  
  if (now > userData.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userData.count >= maxRequests) {
    return false;
  }

  userData.count++;
  return true;
}

// POST - Submit new enquiry
export async function POST(request: NextRequest) {
  try {
    // Fixed rate limiting with proper headers handling
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || '127.0.0.1';
    
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many enquiries submitted. Please try again after 15 minutes.',
        },
        { status: 429 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, email, phone, product, quantity, price, message } = body;

    // Basic validation
    if (!name || !email || !phone || !product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: name, email, phone, and product are required.',
        },
        { status: 400 }
      );
    }

    // Create new enquiry - product field accepts any string value now
    const enquiry = new Enquiry({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      product: product.trim(),
      quantity: quantity?.trim() || 'Not specified',
      price: price?.trim() || 'Not specified',
      message: message?.trim() || 'No additional message'
    });

    await enquiry.save();

    console.log('New enquiry received:', {
      id: enquiry._id,
      name: enquiry.name,
      email: enquiry.email,
      product: enquiry.product,
      timestamp: enquiry.createdAt
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Enquiry submitted successfully! We will contact you within 24 hours.',
        data: {
          id: enquiry._id,
          submittedAt: enquiry.createdAt
        }
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('Error processing enquiry:', err);

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((error: any) => ({
        field: error.path,
        message: error.message
      }));

      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// GET - Fetch all enquiries (for admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query with proper typing
    const query: Record<string, any> = {};
    if (status && ['new', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Build sort object with proper typing
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [enquiries, totalCount] = await Promise.all([
      Enquiry.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: enquiries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalEnquiries: totalCount,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1
      },
      filters: {
        status: status || 'all',
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching enquiries:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching enquiries'
      },
      { status: 500 }
    );
  }
}