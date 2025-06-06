import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { Box } from "@/models/Box";

// GET: Fetch all boxes
export async function GET() {
  await connectDB();

  try {
    const boxes = await Box.find({});
    return NextResponse.json(boxes, { status: 200 });
  } catch (error) {
    console.error("Get boxes error:", error);
    return NextResponse.json({ message: "Failed to fetch boxes" }, { status: 500 });
  }
}

// POST: Create a new box
export async function POST(req: NextRequest) {
  await connectDB();
  
  try {
    const body = await req.json();
    const { name, description, imageBase64, price } = body;

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json({ message: "Name, description, and price are required" }, { status: 400 });
    }

    // Validate price
    if (price <= 0) {
      return NextResponse.json({ message: "Price must be greater than 0" }, { status: 400 });
    }

    let imageUrl = "";
    if (imageBase64?.startsWith("data:image")) {
      try {
        const uploaded = await cloudinary.uploader.upload(imageBase64, {
          folder: "boxes",
        });
        imageUrl = uploaded.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
      }
    }

    const box = await Box.create({
      name,
      description,
      image: imageUrl,
      price: Number(price)
    });

    return NextResponse.json(box, { status: 201 });
  } catch (error) {
    console.error("Create box error:", error);
    return NextResponse.json({ message: "Failed to create box" }, { status: 500 });
  }
}

// DELETE: Delete box by ID (using query parameter)
export async function DELETE(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Missing box ID" }, { status: 400 });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ message: "Invalid box ID format" }, { status: 400 });
    }

    const box = await Box.findById(id);
    if (!box) {
      return NextResponse.json({ message: "Box not found" }, { status: 404 });
    }

    // Delete image from Cloudinary
    if (box.image) {
      try {
        const urlParts = box.image.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `boxes/${publicIdWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (imageDeleteError) {
        console.error("Failed to delete image from Cloudinary:", imageDeleteError);
      }
    }

    await Box.findByIdAndDelete(id);

    return NextResponse.json({ message: "Box deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete box error:", error);
    return NextResponse.json({ message: "Failed to delete box" }, { status: 500 });
  }
}