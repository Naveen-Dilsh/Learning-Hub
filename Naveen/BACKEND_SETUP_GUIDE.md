# SmartLearn LMS - Complete Backend Setup Guide

## Prerequisites
- Node.js 18+ installed
- Neon database account
- PayHere merchant account (for payments)
- Cloudflare account (for video streaming)
- Google OAuth credentials (for authentication)

---

## STEP 1: Environment Variables Setup

### 1.1 Get Your Neon Connection String
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection string" and copy the PostgreSQL connection string
4. It should look like: `postgresql://user:password@host/database?sslmode=require`

### 1.2 Add Environment Variables in v0
1. Click **"Vars"** in the left sidebar
2. Add all these variables:

\`\`\`
# Database
NEON_DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# NextAuth
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# PayHere (get from PayHere merchant dashboard)
PAYHERE_MERCHANT_ID=your-merchant-id
PAYHERE_MERCHANT_SECRET=your-merchant-secret

# Cloudflare Stream (get from Cloudflare dashboard)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
\`\`\`

### 1.3 Generate NEXTAUTH_SECRET
Run this command in your terminal:
\`\`\`bash
openssl rand -base64 32
\`\`\`
Copy the output and paste it as NEXTAUTH_SECRET

---

## STEP 2: Install Dependencies

Run this command to install all required packages:

\`\`\`bash
npm install next-auth bcryptjs jsonwebtoken axios jose
npm install -D prisma @prisma/client
\`\`\`

---

## STEP 3: Initialize Prisma

### 3.1 Generate Prisma Client
\`\`\`bash
npx prisma generate
\`\`\`

### 3.2 Create Database Tables (Migration)
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

This will:
- Create all tables in your Neon database
- Generate the Prisma client
- Create a migration file

### 3.3 Verify Database Connection
\`\`\`bash
npx prisma db push
\`\`\`

---

## STEP 4: Seed Initial Data (Optional)

Create a seed script to populate your database with test data:

\`\`\`bash
npm run seed
\`\`\`

This will create:
- Test admin user
- Test instructor user
- Test student user
- Sample courses

---

## STEP 5: Set Up NextAuth Authentication

### 5.1 Create NextAuth Configuration
The NextAuth configuration is already in `lib/auth.js`

### 5.2 Create Auth API Route
The auth API route is already in `app/api/auth/[...nextauth]/route.js`

### 5.3 Test Authentication
1. Start your dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signin`
3. Try signing up with email/password

---

## STEP 6: Set Up PayHere Payment Gateway

### 6.1 Get PayHere Credentials
1. Go to [PayHere Merchant Dashboard](https://merchant.payhere.lk)
2. Login to your account
3. Go to Settings → API Keys
4. Copy your Merchant ID and Merchant Secret
5. Add them to your environment variables

### 6.2 Configure PayHere Webhook
1. In PayHere dashboard, go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/payhere/notify`
3. Select events: Payment Completed, Payment Failed

### 6.3 Test Payment Flow
1. Go to a course page
2. Click "Purchase Course"
3. You'll be redirected to PayHere checkout
4. Use test card: 4111111111111111 (Visa)

---

## STEP 7: Set Up Cloudflare Stream for Videos

### 7.1 Get Cloudflare Credentials
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to Stream → API Tokens
4. Create a new token with Stream permissions
5. Copy Account ID and API Token
6. Add them to environment variables

### 7.2 Upload Videos
1. Go to instructor dashboard
2. Create a course
3. Upload videos (they'll be uploaded to Cloudflare Stream)
4. Videos are automatically protected with signed tokens

### 7.3 Test Video Playback
1. Enroll in a course as a student
2. Go to course page
3. Click on a video to watch
4. Video should play with DRM protection

---

## STEP 8: Verify All Backend Systems

### 8.1 Check Database Connection
\`\`\`bash
npx prisma studio
\`\`\`
This opens Prisma Studio where you can view all database records

### 8.2 Test API Endpoints
Use Postman or curl to test:

\`\`\`bash
# Get all courses
curl http://localhost:3000/api/courses

# Create a course (requires auth)
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"My Course","description":"Test","price":99}'

# Get user enrollments
curl http://localhost:3000/api/student/enrollments
\`\`\`

### 8.3 Check Logs
Monitor your terminal for any errors during:
- Database queries
- API requests
- Authentication flows
- Payment processing

---

## STEP 9: Production Deployment

### 9.1 Deploy to Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables in Vercel dashboard
5. Deploy

### 9.2 Update Environment Variables for Production
- Change `NEXTAUTH_URL` to your production domain
- Update PayHere webhook URL to production domain
- Use production API keys (not test keys)

### 9.3 Run Migrations on Production
\`\`\`bash
npx prisma migrate deploy
\`\`\`

---

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL is correct
- Verify Neon database is running
- Check firewall allows connections

### NextAuth Not Working
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Clear browser cookies and try again

### PayHere Payment Failing
- Verify Merchant ID and Secret are correct
- Check webhook URL is accessible
- Use test credentials first

### Video Upload Failing
- Verify Cloudflare API token is valid
- Check Account ID is correct
- Ensure video file is under 5GB

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Run Prisma migrations
4. ✅ Test authentication
5. ✅ Configure PayHere
6. ✅ Set up Cloudflare Stream
7. ✅ Deploy to Vercel

Your LMS is now ready for production!
