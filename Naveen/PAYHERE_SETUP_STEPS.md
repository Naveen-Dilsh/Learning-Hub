# PayHere Payment Gateway Setup - Step by Step

## What is PayHere?
PayHere is a payment gateway for Sri Lanka that allows you to:
- Accept online payments
- Process credit/debit cards
- Handle recurring payments
- Receive webhooks for payment updates

---

## Step 1: Create PayHere Account

### 1.1 Sign Up
1. Go to [PayHere Merchant Dashboard](https://merchant.payhere.lk)
2. Click "Sign Up"
3. Fill in your business details
4. Verify your email

### 1.2 Complete KYC
1. Upload business documents
2. Wait for approval (usually 1-2 days)

---

## Step 2: Get PayHere Credentials

### 2.1 Get Merchant ID and Secret
1. Login to PayHere dashboard
2. Go to Settings → API Keys
3. Copy your Merchant ID
4. Copy your Merchant Secret

### 2.2 Add to Environment Variables
Add to v0 Vars:
\`\`\`
PAYHERE_MERCHANT_ID=your-merchant-id
PAYHERE_MERCHANT_SECRET=your-merchant-secret
\`\`\`

---

## Step 3: Understand PayHere Payment Flow

### 3.1 Payment Flow
1. Student clicks "Buy Course"
2. App creates payment record in database
3. App generates PayHere checkout form
4. Student is redirected to PayHere checkout
5. Student enters card details
6. PayHere processes payment
7. PayHere sends webhook to your app
8. App updates payment status
9. Student is enrolled in course

### 3.2 Webhook Flow
1. PayHere sends POST request to your webhook URL
2. Your app verifies the hash
3. Your app updates payment status
4. Your app enrolls student in course

---

## Step 4: Configure Webhook URL

### 4.1 Set Webhook URL in PayHere
1. Login to PayHere dashboard
2. Go to Settings → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/payhere/notify`
4. Select events:
   - Payment Completed
   - Payment Failed
   - Payment Cancelled

### 4.2 For Local Testing
Use ngrok to expose your local server:
\`\`\`bash
npm install -g ngrok
ngrok http 3000
\`\`\`

Then add webhook URL: `https://your-ngrok-url.ngrok.io/api/payhere/notify`

---

## Step 5: Test Payment Flow

### 5.1 Use Test Credentials
PayHere provides test merchant credentials:
- Merchant ID: 1234567
- Merchant Secret: test-secret

### 5.2 Test Card Numbers
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Expiry: Any future date
- CVV: Any 3 digits

### 5.3 Test Payment
1. Go to course page
2. Click "Purchase Course"
3. You'll be redirected to PayHere checkout
4. Enter test card details
5. Complete payment
6. You should be redirected to success page

---

## Step 6: Verify Payment in Database

### 6.1 Check Payment Record
\`\`\`bash
npx prisma studio
\`\`\`

Go to Payment table and verify:
- Payment status is "COMPLETED"
- PayHere Order ID is stored
- PayHere Payment ID is stored

### 6.2 Check Enrollment
Go to Enrollment table and verify:
- Student is enrolled in course
- Enrollment date is set

---

## Step 7: Understanding PayHere Hash

### 7.1 What is Hash?
Hash is a security mechanism to verify that the payment request came from PayHere.

### 7.2 Hash Generation
\`\`\`javascript
const hash = md5(`${merchantId}${orderId}${amount}${merchantSecret}`)
\`\`\`

### 7.3 Hash Verification
When PayHere sends webhook:
\`\`\`javascript
const expectedHash = md5(`${merchantId}${orderId}${amount}${merchantSecret}`)
if (hash === expectedHash) {
  // Payment is legitimate
}
\`\`\`

---

## Step 8: Common Issues

### Issue: "Payment not being processed"
- Verify Merchant ID and Secret are correct
- Check webhook URL is accessible
- Verify hash calculation is correct

### Issue: "Webhook not being received"
- Check webhook URL in PayHere settings
- Verify your server is running
- Check firewall allows incoming requests
- Check logs for errors

### Issue: "Student not being enrolled"
- Verify webhook is being received
- Check hash verification is passing
- Verify enrollment creation in database

### Issue: "Test payments not working"
- Use test merchant credentials
- Use test card numbers
- Check payment amount is correct

---

## Step 9: Production Deployment

### 9.1 Switch to Live Credentials
1. Go to PayHere dashboard
2. Get live Merchant ID and Secret
3. Update environment variables:
\`\`\`
PAYHERE_MERCHANT_ID=your-live-merchant-id
PAYHERE_MERCHANT_SECRET=your-live-merchant-secret
\`\`\`

### 9.2 Update Webhook URL
1. Go to PayHere settings
2. Update webhook URL to production domain:
\`\`\`
https://yourdomain.com/api/payhere/notify
\`\`\`

### 9.3 Test Live Payment
1. Use real card details
2. Process a test payment
3. Verify payment is recorded
4. Verify student is enrolled

---

## Step 10: PayHere API Reference

### Create Payment
\`\`\`javascript
POST /api/payhere/create-payment
{
  "courseId": "course-id",
  "amount": 4999
}
\`\`\`

### Webhook Notification
\`\`\`javascript
POST /api/payhere/notify
{
  "merchant_id": "1234567",
  "order_id": "order-123",
  "payment_id": "payment-123",
  "payhere_amount": "4999.00",
  "payhere_currency": "LKR",
  "status_code": 2,
  "status_message": "Success",
  "hash": "hash-value"
}
\`\`\`

---

## Next Steps

✅ PayHere is now set up!

You can now:
1. Accept course payments
2. Process student enrollments
3. Track payment status
4. Handle payment failures
5. Generate revenue reports

For more info: https://www.payhere.lk/
