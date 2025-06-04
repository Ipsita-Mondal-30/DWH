import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enquiry from '@/models/Enquiry';
import mongoose from 'mongoose';

// GET - Fetch single enquiry
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid enquiry ID'
        },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(id).lean();

    if (!enquiry) {
      return NextResponse.json(
        {
          success: false,
          message: 'Enquiry not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: enquiry
    });

  } catch (error) {
    console.error('Error fetching enquiry:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching enquiry'
      },
      { status: 500 }
    );
  }
}

// PUT - Update enquiry status
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid enquiry ID'
        },
        { status: 400 }
      );
    }

    // Validate status
    if (!status || !['new', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Status must be one of: new, in-progress, completed, cancelled'
        },
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
        {
          success: false,
          message: 'Enquiry not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry
    });

  } catch (error) {
    console.error('Error updating enquiry:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating enquiry'
      },
      { status: 500 }
    );
  }
}