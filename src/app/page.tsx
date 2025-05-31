'use client'

// components/ImageUploader.tsx
import { useState } from 'react';

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');

  const uploadImage = async () => {
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64 = reader.result;

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      const data = await res.json();
      setUrl(data.url);
    };
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null;
          setFile(selectedFile);
        }}
      />
      <button onClick={uploadImage}>Upload</button>
      {url && <img src={url} alt="Uploaded" width={200} />}
    </div>
  );
}
