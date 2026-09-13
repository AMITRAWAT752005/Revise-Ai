import { v2 as cloudinary } from 'cloudinary';
import '../config/env.js';

const requiredConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

cloudinary.config({
  cloud_name: requiredConfig.cloud_name,
  api_key: requiredConfig.api_key,
  api_secret: requiredConfig.api_secret,
});

const getMissingCloudinaryConfig = () => Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

const createCloudinaryConfigError = (missingKeys) => {
  const error = new Error(`Cloudinary is not configured. Missing: ${missingKeys.join(', ')}`);
  error.statusCode = 500;
  return error;
};

const createCloudinaryUploadError = (error) => {
  if (error?.http_code === 401 || error?.http_code === 403) {
    const uploadError = new Error(
      'Cloudinary rejected the upload. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and whether your Cloudinary account allows authenticated raw file uploads.'
    );
    uploadError.statusCode = 502;
    uploadError.isCloudinaryUploadError = true;
    uploadError.cause = error;
    return uploadError;
  }

  error.statusCode = error.statusCode || 502;
  error.isCloudinaryUploadError = true;
  return error;
};

const getSafePublicId = (fileName) => {
  const baseName = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return baseName || `material_${Date.now()}`;
};

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer to upload.
 * @param {string} fileName - Original file name for reference.
 * @param {string} folder - The folder in Cloudinary to upload to.
 * @returns {Promise<Object>} The Cloudinary upload result.
 */
export const uploadToCloudinary = (fileBuffer, fileName, folder = 'reviseai_materials') => {
  const missingConfig = getMissingCloudinaryConfig();
  if (missingConfig.length > 0) {
    return Promise.reject(createCloudinaryConfigError(missingConfig));
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw', // Use 'raw' to support pdf, docx, txt correctly without image transformations
        public_id: getSafePublicId(fileName),
        filename_override: fileName,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(createCloudinaryUploadError(error));
        }
        resolve(result);
      }
    );

    // End the stream with the buffer
    uploadStream.end(fileBuffer);
  });
};

/**
 * Deletes a file from Cloudinary using its public ID.
 * @param {string} publicId - The Cloudinary public ID of the resource.
 * @param {string} resourceType - The resource type (default 'raw').
 * @returns {Promise<Object>} The Cloudinary deletion result.
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};
