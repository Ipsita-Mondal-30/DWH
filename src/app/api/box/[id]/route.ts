import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Box } from "@/models/Box";
import cloudinary from "@/lib/cloudinary";

interface BoxUpdateData {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
}

interface BoxRequestBody {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  imageBase64?: string;
}

// GET: Fetch box by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid box ID" }, { status: 400 });
  }

  try {
    const box = await Box.findById(id);
    if (!box) {
      return NextResponse.json({ message: "Box not found" }, { status: 404 });
    }
    return NextResponse.json(box, { status: 200 });
  } catch (error) {
    console.error("Fetch box error:", error);
    return NextResponse.json({ message: "Failed to fetch box" }, { status: 500 });
  }
}

// PUT: Update box by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid box ID" }, { status: 400 });
  }

  try {
    const body: BoxRequestBody = await req.json();
    const { name, description, price, image, imageBase64 } = body;

    const update: BoxUpdateData = {};

    // Only add fields that are provided
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    
    // Handle price validation and update
    if (price !== undefined) {
      if (price <= 0) {
        return NextResponse.json({ message: "Price must be greater than 0" }, { status: 400 });
      }
      update.price = Number(price);
    }

    // Handle image upload
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageBase64, {
          folder: "boxes",
        });
        update.image = uploadRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
      }
    } else if (image && !update.image) {
      update.image = image;
    }

    const updatedBox = await Box.findByIdAndUpdate(id, update, { 
      new: true,
      runValidators: true 
    });

    if (!updatedBox) {
      return NextResponse.json({ message: "Box not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBox, { status: 200 });
  } catch (error) {
    console.error("Update box error:", error);
    return NextResponse.json({ message: "Failed to update box" }, { status: 500 });
  }
}