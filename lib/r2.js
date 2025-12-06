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
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "lms-resources"

/**
 * Generate a presigned URL for uploading a file to R2
 * @param {string} key - The object key (path) in the bucket
 * @param {string} contentType - The MIME type of the file
 * @param {number} expiresIn - URL expiry in seconds (default: 1 hour)
 */
export async function getUploadUrl(key, contentType, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
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
 */
export async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
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
