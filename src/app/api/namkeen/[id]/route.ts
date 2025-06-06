import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Namkeen } from "@/models/Namkeen";
import cloudinary from "@/lib/cloudinary";

interface Pricing {
  quantity: number;
  unit: 'gm' | 'kg' | 'piece' | 'dozen';
  price: number;
}

interface NamkeenUpdateData {
  name?: string;
  description?: string;
  type?: string;
  pricing?: Pricing[];
  image?: string;
}

interface NamkeenRequestBody {
  name?: string;
  description?: string;
  type?: string;
  pricing?: Pricing[];
  image?: string;
  imageBase64?: string;
}

// GET: Fetch namkeen by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid namkeen ID" }, { status: 400 });
  }

  try {
    const namkeen = await Namkeen.findById(id);
    if (!namkeen) {
      return NextResponse.json({ message: "Namkeen not found" }, { status: 404 });
    }
    return NextResponse.json(namkeen, { status: 200 });
  } catch (error) {
    console.error("Fetch namkeen error:", error);
    return NextResponse.json({ message: "Failed to fetch namkeen" }, { status: 500 });
  }
}

// PUT: Update namkeen by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    return NextResponse.json({ message: "Invalid namkeen ID" }, { status: 400 });
  }

  try {
    const body: NamkeenRequestBody = await req.json();
    const { name, description, type, image, imageBase64, pricing } = body;

    const update: NamkeenUpdateData = {};

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
          folder: "namkeens",
        });
        update.image = uploadRes.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ message: "Image upload failed" }, { status: 500 });
      }
    } else if (image && !update.image) {
      update.image = image;
    }

    const updatedNamkeen = await Namkeen.findByIdAndUpdate(id, update, { 
      new: true,
      runValidators: true 
    });

    if (!updatedNamkeen) {
      return NextResponse.json({ message: "Namkeen not found" }, { status: 404 });
    }

    return NextResponse.json(updatedNamkeen, { status: 200 });
  } catch (error) {
    console.error("Update namkeen error:", error);
    return NextResponse.json({ message: "Failed to update namkeen" }, { status: 500 });
  }
}