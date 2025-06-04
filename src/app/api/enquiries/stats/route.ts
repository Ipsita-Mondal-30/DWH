import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enquiry from '@/models/Enquiry';

export async function GET() {
  try {
    await connectDB();

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    // Run aggregation queries
    const [
      totalCount,
      statusCounts,
      todayCount,
      weekCount
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Enquiry.countDocuments({ createdAt: { $gte: today } }),
      Enquiry.countDocuments({ createdAt: { $gte: weekAgo } })
    ]);

    // Format status counts
    const statusStats = {
      new: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };

    statusCounts.forEach((item: { _id: string; count: number }) => {
      if (item._id in statusStats) {
        statusStats[item._id as keyof typeof statusStats] = item.count;
      }
    });

    const stats = {
      total: totalCount,
      ...statusStats,
      today: todayCount,
      thisWeek: weekCount
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching statistics'
      },
      { status: 500 }
    );
  }
}