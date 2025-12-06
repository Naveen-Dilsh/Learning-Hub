# Cloudflare Stream Setup - Step by Step

## What is Cloudflare Stream?
Cloudflare Stream is a video hosting platform that provides:
- Secure video hosting
- DRM (Digital Rights Management) protection
- Signed URLs for access control
- Automatic transcoding
- Analytics

---

## Step 1: Create Cloudflare Account

### 1.1 Sign Up
1. Go to [Cloudflare](https://dash.cloudflare.com)
2. Click "Sign Up"
3. Enter email and password
4. Verify email

### 1.2 Add Domain (Optional)
You can add your domain for better integration, but it's optional.

---

## Step 2: Get Cloudflare Credentials

### 2.1 Get Account ID
1. Login to Cloudflare dashboard
2. Go to Account Settings
3. Copy Account ID

### 2.2 Create API Token
1. Go to Account Settings → API Tokens
2. Click "Create Token"
3. Select "Stream" permissions
4. Copy the API Token

### 2.3 Add to Environment Variables
Add to v0 Vars:
\`\`\`
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
\`\`\`

---

## Step 3: Understand Video Upload Flow

### 3.1 Upload Flow
1. Instructor uploads video file
2. App sends video to Cloudflare Stream API
3. Cloudflare returns video ID
4. App stores video ID in database
5. Video is transcoded by Cloudflare

### 3.2 Playback Flow
1. Student requests to watch video
2. App checks if student is enrolled
3. App generates signed JWT token
4. App returns video embed URL with token
5. Student watches video with DRM protection

---

## Step 4: Test Video Upload

### 4.1 Go to Instructor Dashboard
1. Start dev server: `npm run dev`
2. Sign in as instructor
3. Go to `/instructor/courses`

### 4.2 Create a Course
1. Click "Create Course"
2. Fill in course details
3. Click "Create"

### 4.3 Upload a Video
1. Go to course page
2. Click "Add Video"
3. Select a video file (MP4, WebM, etc.)
4. Click "Upload"
5. Wait for upload to complete

### 4.4 Verify Video in Database
\`\`\`bash
npx prisma studio
\`\`\`

Go to Video table and verify:
- Video title is stored
- Cloudflare Stream ID is stored
- Duration is set

---

## Step 5: Test Video Playback

### 5.1 Enroll as Student
1. Sign out as instructor
2. Sign in as student
3. Go to `/courses`
4. Find the course you created
5. Click "Enroll"

### 5.2 Watch Video
1. Go to course page
2. Click on video
3. Video should play with DRM protection

### 5.3 Verify Token Generation
Check browser console for:
- Signed JWT token is generated
- Token expires in 1 hour
- Video embed URL is correct

---

## Step 6: Understanding Signed Tokens

### 6.1 What is a Signed Token?
A signed token is a JWT that proves:
- Student is enrolled in course
- Token is not expired
- Token is signed by your secret

### 6.2 Token Generation
\`\`\`javascript
const token = generateSignedToken(videoId, signingSecret, 3600)
\`\`\`

### 6.3 Token Verification
Cloudflare verifies the token before allowing playback.

---

## Step 7: Common Issues

### Issue: "Video upload fails"
- Verify CLOUDFLARE_ACCOUNT_ID is correct
- Verify CLOUDFLARE_API_TOKEN is valid
- Check video file size (max 5GB)
- Check video format is supported

### Issue: "Video won't play"
- Verify student is enrolled in course
- Check signed token is generated
- Verify token is not expired
- Check browser console for errors

### Issue: "Signed token not working"
- Verify signing secret is correct
- Check token expiration time
- Verify video ID is correct

---

## Step 8: Video Formats Supported

Cloudflare Stream supports:
- MP4 (H.264 video codec)
- WebM (VP8/VP9 video codec)
- MOV
- MKV
- FLV
- AVI
- And many more

**Recommended:** MP4 with H.264 codec for best compatibility.

---

## Step 9: Production Deployment

### 9.1 Verify Credentials
Make sure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are set in production.

### 9.2 Test Video Upload
1. Deploy to Vercel
2. Sign in as instructor
3. Upload a test video
4. Verify video plays

### 9.3 Monitor Video Analytics
1. Go to Cloudflare dashboard
2. Go to Stream → Analytics
3. View video views and engagement

---

## Step 10: Cloudflare Stream API Reference

### Upload Video
\`\`\`javascript
POST https://api.cloudflare.com/client/v4/accounts/{accountId}/stream
Headers: Authorization: Bearer {apiToken}
Body: FormData with video file
\`\`\`

### Get Video Info
\`\`\`javascript
GET https://api.cloudflare.com/client/v4/accounts/{accountId}/stream/{videoId}
Headers: Authorization: Bearer {apiToken}
\`\`\`

### Generate Signed URL
\`\`\`javascript
const token = generateSignedToken(videoId, signingSecret, 3600)
const url = `https://customer-${accountId}.cloudflarestream.com/${videoId}/iframe?token=${token}`
\`\`\`

---

## Next Steps

✅ Cloudflare Stream is now set up!

You can now:
1. Upload videos securely
2. Protect videos with DRM
3. Generate signed URLs
4. Track video analytics
5. Transcode videos automatically

For more info: https://developers.cloudflare.com/stream/
