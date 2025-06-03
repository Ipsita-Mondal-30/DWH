import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const { id } =await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Fetch product error:", error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();

  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, description, type, image, imageBase64 } = body;

    const update: any = { name, description, type };

    if (imageBase64 && imageBase64.startsWith("data:image")) {
      // Upload new image to Cloudinary (assuming you have cloudinary imported & configured)
      const cloudinary = require("@/lib/cloudinary").default; // adjust import path

      try {
        const uploadRes = await cloudinary.uploader.upload(imageBase64, {
          folder: "products",
        });
        update.image = uploadRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
      }
    } else if (image) {
      update.image = image; // keep existing image url if no new imageBase64
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, { new: true });

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

