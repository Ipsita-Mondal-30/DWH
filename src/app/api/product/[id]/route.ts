import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Product } from "@/models/Product";
import cloudinary from "@/lib/cloudinary";

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface ProductUpdateData {
  name?: string;
  description?: string;
  type?: string;
  pricing?: Pricing[];
  image?: string;
}

interface ProductRequestBody {
  name?: string;
  description?: string;
  type?: string;
  pricing?: Pricing[];
  image?: string;
  imageBase64?: string;
}

// GET: Fetch product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

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
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
  }

  try {
    const body: ProductRequestBody = await req.json();
    const { name, description, type, image, imageBase64, pricing } = body;

    const update: ProductUpdateData = {};

    // Only add fields that are provided
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (type !== undefined) update.type = type;

    // Handle pricing validation and update
    if (pricing !== undefined) {
      if (!Array.isArray(pricing) || pricing.length === 0) {
        return NextResponse.json({ message: "At least one pricing option is required" }, { status: 400 });
      }

      // Validate each pricing option
      for (const price of pricing) {
        if (!price.quantity || price.quantity <= 0) {
          return NextResponse.json({ message: "All pricing options must have a valid quantity greater than 0" }, { status: 400 });
        }
        if (!price.price || price.price <= 0) {
          return NextResponse.json({ message: "All pricing options must have a valid price greater than 0" }, { status: 400 });
        }
        if (!['gm', 'kg', 'piece', 'dozen'].includes(price.unit)) {
          return NextResponse.json({ message: "Invalid unit. Must be 'gm', 'kg', 'piece', or 'dozen'" }, { status: 400 });
        }
      }

      update.pricing = pricing.map((p: Pricing) => ({
        quantity: Number(p.quantity),
        unit: p.unit,
        price: Number(p.price)
      }));
    }

    // Handle image upload
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      try {
        const uploadRes = await cloudinary.uploader.upload(imageBase64, {
          folder: "products",
        });
        update.image = uploadRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
      }
    } else if (image && !update.image) {
      update.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, update, { 
      new: true,
      runValidators: true 
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