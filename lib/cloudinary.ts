// Cloudinary utilities for image upload and management

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export const uploadImageToCloudinary = async (
  file: File | Blob,
  folder: string = 'vehicle-photos'
): Promise<CloudinaryUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
  formData.append('folder', folder);
  formData.append('timestamp', String(Date.now()));

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image to Cloudinary');
  }

  return response.json();
};

export const uploadBase64Image = async (
  base64String: string,
  folder: string = 'vehicle-photos'
): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
};

export const optimizeImageUrl = (url: string, width: number = 800, quality: number = 80): string => {
  // Extract the version and public_id from Cloudinary URL
  const matches = url.match(/\/v(\d+)\/(.+)$/);
  if (!matches) return url;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_${quality},f_auto/${matches[2]}`;
};

export const addWatermark = (url: string, text: string = 'Bespoke Preservation'): string => {
  const matches = url.match(/\/v(\d+)\/(.+)$/);
  if (!matches) return url;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/l_text:Arial_40_bold:${encodeURIComponent(text)},co_rgb:40E0FF,g_south_east,x_20,y_20/${matches[2]}`;
};
