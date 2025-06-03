import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import cloudinary from "@/lib/cloudinary";

// GET: Fetch product by ID
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  await connectDB();
  const { id } = context.params;

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

// PUT: Update product by ID
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  await connectDB();
  const { id } = context.params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, description, type, price, image, imageBase64 } = body;

    const update: any = {
      name,
      description,
      type,
      price: price ?? 0,
    };

    // If a new image is uploaded as base64, upload to Cloudinary
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: "products",
      });
      update.image = uploadRes.secure_url;
    } else if (image) {
      // Retain existing image URL if passed directly
      update.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}
