// pages/api/upload.js
import cloudinary from '@/lib/cloudinary';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const body = await req.json();
  const { image } = body;

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'nextjs_uploads',
    });

    return new Response(JSON.stringify({ url: result.secure_url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return new Response(JSON.stringify({ message: 'Upload failed', error: String(error) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}


//get post //put