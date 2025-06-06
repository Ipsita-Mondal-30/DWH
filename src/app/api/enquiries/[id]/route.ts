import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Enquiry from '@/models/Enquiry';

interface Params {
  id: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params; // Await the params Promise

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid enquiry ID' },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(id).lean();

    if (!enquiry) {
      return NextResponse.json(
        { success: false, message: 'Enquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (error) {
    console.error('GET /api/enquiries/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params; // Await the params Promise

  try {
    await connectDB();

    const { status } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid enquiry ID' },
        { status: 400 }
      );
    }

    if (
      !status ||
      !['new', 'in-progress', 'completed', 'cancelled'].includes(status)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return NextResponse.json(
        { success: false, message: 'Enquiry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('PUT /api/enquiries/[id] error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}