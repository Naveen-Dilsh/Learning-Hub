import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Initialize S3 client for Cloudflare R2
const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  // Newer SDKs sign a CRC32 checksum of an empty body into presigned URLs,
  // which makes R2 reject the real browser upload with 403
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "lms-resources"

// Public bucket for user-uploaded images (profile photos, course thumbnails,
// payment receipts). Kept separate from BUCKET_NAME so course resources stay private.
export const IMAGES_BUCKET_NAME = process.env.R2_IMAGES_BUCKET_NAME
export const IMAGES_PUBLIC_URL = process.env.R2_IMAGES_PUBLIC_URL?.replace(/\/+$/, "")

/**
 * Generate a presigned URL for uploading a file to R2
 * @param {string} key - The object key (path) in the bucket
 * @param {string} contentType - The MIME type of the file
 * @param {number} expiresIn - URL expiry in seconds (default: 1 hour)
 * @param {string} bucket - Bucket to upload into (default: resources bucket)
 */
export async function getUploadUrl(key, contentType, expiresIn = 3600, bucket = BUCKET_NAME) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(S3, command, { expiresIn })
  return uploadUrl
}

/**
 * Generate a presigned URL for downloading a file from R2
 * @param {string} key - The object key (path) in the bucket
 * @param {number} expiresIn - URL expiry in seconds (default: 1 hour)
 * @param {string} fileName - Optional filename for Content-Disposition header
 */
export async function getDownloadUrl(key, expiresIn = 3600, fileName = null) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  }

  // Add Content-Disposition to force download with original filename
  if (fileName) {
    params.ResponseContentDisposition = `attachment; filename="${fileName}"`
  }

  const command = new GetObjectCommand(params)
  const downloadUrl = await getSignedUrl(S3, command, { expiresIn })
  return downloadUrl
}

/**
 * Delete a file from R2
 * @param {string} key - The object key (path) in the bucket
 * @param {string} bucket - Bucket to delete from (default: resources bucket)
 */
export async function deleteFile(key, bucket = BUCKET_NAME) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  })

  await S3.send(command)
}

/**
 * Generate a unique file key for storing in R2
 * @param {string} courseId - The course ID
 * @param {string} fileName - The original filename
 */
export function generateFileKey(courseId, fileName) {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `courses/${courseId}/resources/${timestamp}-${randomId}-${sanitizedFileName}`
}
