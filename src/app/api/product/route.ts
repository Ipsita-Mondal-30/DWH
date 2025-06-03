import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { Product, ProductType } from "@/models/Product";

export async function GET() {
  await connectDB();

  try {
    const products = await Product.find({});
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const { name, description, type = "none", imageBase64, price } = body;

  if (price == null || isNaN(price)) {
    return new Response("Price is required and must be a number", { status: 400 });
  }

  let imageUrl = "";
  if (imageBase64?.startsWith("data:image")) {
    try {
      const uploaded = await cloudinary.uploader.upload(imageBase64, {
        folder: "products",
      });
      imageUrl = uploaded.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return new Response("Failed to upload image", { status: 500 });
    }
  }

  const product = await Product.create({
    name,
    description,
    type,
    image: imageUrl,
    price,
  });

  return Response.json(product);
}
  


export async function PUT(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  await connectDB();

  const body = await req.json();
  const { name, description, type, image, imageBase64, price } = body;

  const update: any = { name, description, type };

  if (price != null && !isNaN(price)) {
    update.price = price;
  }

  if (imageBase64 && imageBase64.startsWith("data:image")) {
    try {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: "products",
      });
      update.image = uploadRes.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return new Response("Image upload failed", { status: 500 });
    }
  }

  if (image && !update.image) {
    update.image = image;
  }

  try {
    const updated = await Product.findByIdAndUpdate(params.id, update, { new: true });
    if (!updated) {
      return new Response("Product not found", { status: 404 });
    }
    return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Update product error:", error);
    return new Response("Failed to update product", { status: 500 });
  }
}

  

export async function DELETE(req: NextRequest) {
  await connectDB();

  // Get product ID from query params: /api/product?id=xxx
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "Missing product ID" }, { status: 400 });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Optionally: delete image from Cloudinary too (you can implement this if you store public_id)

    await product.deleteOne();

    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
