import crypto from "crypto"
import FormData from "form-data"

// Helper function to extract clean account ID from various input formats
export function cleanCloudflareAccountId(accountId) {
  if (!accountId) return null
  
  // Remove protocol if present (https://)
  let cleaned = accountId.replace(/^https?:\/\//, "")
  
  // Extract subdomain from full URL (e.g., customer-4tnscqgonlylt4dq.cloudflarestream.com -> 4tnscqgonlylt4dq)
  const match = cleaned.match(/customer-([a-z0-9]+)\.cloudflarestream\.com/)
  if (match) {
    return match[1]
  }
  
  // If already just the subdomain (4tnscqgonlylt4dq), use as is
  if (cleaned.match(/^[a-z0-9]+$/) && cleaned.length > 10) {
    return cleaned
  }
  
  // If it's customer-XXXX format without .cloudflarestream.com, extract XXXX
  if (cleaned.startsWith("customer-")) {
    return cleaned.replace("customer-", "")
  }
  
  return cleaned
}

export async function generateSignedToken(videoId, accountId, apiToken, expiresIn = 3600) {
  if (!videoId || !accountId || !apiToken) {
    throw new Error(`Missing required parameters: videoId=${!!videoId}, accountId=${!!accountId}, apiToken=${!!apiToken}`)
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + expiresIn

  console.log("[v0] Generating Cloudflare token for video:", {
    videoId,
    accountId: accountId.substring(0, 8) + "...",
    exp,
    expiresIn
  })

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${videoId}/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exp: exp,
        }),
      }
    )

    const data = await response.json()
    
    if (!response.ok) {
      console.error("[v0] Cloudflare token API error:", {
        status: response.status,
        error: data
      })
      throw new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown error'}`)
    }

    if (!data.success || !data.result?.token) {
      console.error("[v0] Invalid Cloudflare token response:", data)
      throw new Error("Invalid token response from Cloudflare")
    }

    console.log("[v0] Successfully generated Cloudflare token:", {
      tokenPreview: data.result.token.substring(0, 30) + "..." + data.result.token.substring(data.result.token.length - 20),
      tokenLength: data.result.token.length
    })
    
    return data.result.token
  } catch (error) {
    console.error("[v0] Error generating Cloudflare token:", error.message)
    throw error
  }
}

export function generateIframeSignedToken(videoId, signingKeyId, signingKeyPem, expiresIn = 3600) {
  if (!videoId || !signingKeyId || !signingKeyPem) {
    throw new Error(`Missing required parameters for iframe signing`)
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = now + expiresIn

  const payload = {
    sub: videoId,
    kid: signingKeyId,
    exp: exp,
    nbf: now,
    iat: now,
  }

  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signatureInput)
    .sign(signingKeyPem, "base64url")

  return `${signatureInput}.${signature}`
}

export async function uploadVideoToCloudflare(file, accountId, apiToken) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload video to Cloudflare Stream")
  }

  const data = await response.json()
  return data.result
}

export async function initiateTusUpload(metadata, accountId, apiToken) {
  // ✅ FIX: Use Buffer.from() instead of btoa() to handle Unicode
  const tusMetadata = Object.entries(metadata)
    .map(([key, value]) => {
      const base64Value = Buffer.from(String(value), 'utf-8').toString('base64')
      return `${key} ${base64Value}`
    })
    .join(",")

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": String(metadata.uploadSize),
        "Upload-Metadata": tusMetadata,
      },
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("[v0] Tus upload initiation failed:", errorData)
    throw new Error(`Failed to initiate tus upload: ${errorData.errors?.[0]?.message || response.statusText}`)
  }

  const location = response.headers.get("Location")
  const mediaId = response.headers.get("stream-media-id")

  return { location, mediaId }
}

export async function uploadTusChunk(location, chunk, offset, apiToken) {
  const response = await fetch(location, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Tus-Resumable": "1.0.0",
      "Upload-Offset": String(offset),
      "Content-Type": "application/offset+octet-stream",
    },
    body: chunk,
  })

  if (!response.ok) {
    throw new Error("Failed to upload chunk")
  }

  const newOffset = parseInt(response.headers.get("Upload-Offset") || "0")
  return newOffset
}

export function getCloudflareStreamEmbedUrl(tokenOrVideoId, requireSignedURLs = false) {
  const cleanId = cleanCloudflareAccountId(process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID)
  
  // When using signed URLs, the token REPLACES the video ID in the URL
  // Format: https://customer-CODE.cloudflarestream.com/TOKEN/iframe
  return `https://customer-${cleanId}.cloudflarestream.com/${tokenOrVideoId}/iframe`
}
