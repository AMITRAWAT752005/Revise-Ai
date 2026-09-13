import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(currentDirectory, '../../uploads/materials');
const publicUploadPath = '/uploads/materials';

const getSafeFileName = (fileName) => {
  const extension = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, extension)
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  return `${baseName || 'material'}_${randomUUID()}${extension}`;
};

export const saveMaterialLocally = async (fileBuffer, fileName) => {
  await fs.mkdir(uploadDirectory, { recursive: true });

  const safeFileName = getSafeFileName(fileName);
  const filePath = path.join(uploadDirectory, safeFileName);
  await fs.writeFile(filePath, fileBuffer);

  return {
    secure_url: `${publicUploadPath}/${safeFileName}`,
    public_id: safeFileName,
    storage_provider: 'local',
  };
};

export const deleteLocalMaterial = async (fileUrl) => {
  if (!fileUrl?.startsWith(`${publicUploadPath}/`)) return false;

  const safeFileName = path.basename(fileUrl);
  const filePath = path.resolve(uploadDirectory, safeFileName);

  if (!filePath.startsWith(`${uploadDirectory}${path.sep}`)) return false;

  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};
