const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload image to Cloudinary
 */
export const uploadImage = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `alumni-circle/${folder}`);

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Delete image from Cloudinary (via public_id)
 * Note: Deletion requires signed requests, so we skip it for unsigned uploads.
 * Old images will be orphaned but won't affect functionality.
 */
export const deleteImage = async (imageUrl) => {
  // For unsigned uploads, we can't delete from client-side.
  // This is acceptable for a small app - orphaned images use minimal storage.
  console.warn('Image deletion requires server-side implementation');
};
