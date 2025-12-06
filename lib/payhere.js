import crypto from "crypto"

// hash = UPPERCASE(md5(merchant_id + order_id + amount_formatted + currency + UPPERCASE(md5(merchant_secret))))
export function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  // Format amount with 2 decimal places
  const formattedAmount = Number(amount).toFixed(2)

  // First MD5 hash the merchant secret and uppercase it
  const merchantSecretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase()

  // Then create the full hash string and MD5 it, then uppercase
  const hashString = `${merchantId}${orderId}${formattedAmount}${currency}${merchantSecretHash}`
  const finalHash = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase()

  return finalHash
}

// md5sig = UPPERCASE(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(md5(merchant_secret))))
export function verifyPayHereNotification(
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  md5sig,
  merchantSecret,
) {
  // First MD5 hash the merchant secret and uppercase it
  const merchantSecretHash = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase()

  // Create the verification hash string
  const hashString = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${merchantSecretHash}`
  const localMd5sig = crypto.createHash("md5").update(hashString).digest("hex").toUpperCase()

  return localMd5sig === md5sig
}

// Helper function to format amount with 2 decimal places
export function formatPayHereAmount(amount) {
  return Number(amount).toFixed(2)
}
