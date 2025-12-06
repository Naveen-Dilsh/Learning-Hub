# NextAuth.js Setup - Step by Step

## What is NextAuth.js?
NextAuth.js is an authentication library for Next.js that handles:
- User sign-up and sign-in
- Password hashing and verification
- Session management
- OAuth integration (Google, GitHub, etc.)
- JWT tokens

---

## Step 1: Verify NextAuth Installation

Check if NextAuth is installed:
\`\`\`bash
npm list next-auth
\`\`\`

You should see version 4.24.0 or higher.

---

## Step 2: Set Up Environment Variables

Add these to your v0 Vars section:

\`\`\`
NEXTAUTH_SECRET=your-generated-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
\`\`\`

### 2.1 Generate NEXTAUTH_SECRET
Run this command:
\`\`\`bash
openssl rand -base64 32
\`\`\`

Copy the output and paste it as NEXTAUTH_SECRET.

### 2.2 Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
6. Copy Client ID and Client Secret

---

## Step 3: Verify NextAuth Configuration

Check `lib/auth.js` - it should have:
- CredentialsProvider (email/password)
- GoogleProvider (OAuth)
- JWT callbacks
- Session callbacks

---

## Step 4: Test Authentication

### 4.1 Start Dev Server
\`\`\`bash
npm run dev
\`\`\`

### 4.2 Go to Sign In Page
Open: `http://localhost:3000/auth/signin`

### 4.3 Test Email/Password Sign Up
1. Click "Sign Up"
2. Enter email and password
3. You should be redirected to dashboard

### 4.4 Test Google Sign In
1. Go back to sign in page
2. Click "Sign in with Google"
3. You should be redirected to Google login
4. After login, you should be redirected to dashboard

---

## Step 5: Verify User in Database

### 5.1 Check User Was Created
\`\`\`bash
npx prisma studio
\`\`\`

Go to User table and verify your new user is there.

### 5.2 Check Password Was Hashed
The password should be hashed (looks like: `$2a$10$...`), not plain text.

---

## Step 6: Understanding the Auth Flow

### 6.1 Sign Up Flow
1. User enters email and password
2. Password is hashed with bcryptjs
3. User record is created in database
4. User is automatically signed in
5. JWT token is created
6. User is redirected to dashboard

### 6.2 Sign In Flow
1. User enters email and password
2. User is looked up in database
3. Password is compared with hashed password
4. If valid, JWT token is created
5. User is redirected to dashboard

### 6.3 Protected Routes
Routes like `/dashboard` check if user has valid session:
- If valid: show page
- If invalid: redirect to sign in

---

## Step 7: Using Authentication in Your Code

### 7.1 Get Current User Session
\`\`\`javascript
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function Page() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return <div>Not authenticated</div>
  }
  
  return <div>Welcome {session.user.email}</div>
}
\`\`\`

### 7.2 Check User Role
\`\`\`javascript
const session = await getServerSession(authOptions)

if (session.user.role !== "INSTRUCTOR") {
  return <div>Only instructors can access this</div>
}
\`\`\`

### 7.3 Sign Out
\`\`\`javascript
import { signOut } from "next-auth/react"

export default function LogoutButton() {
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  )
}
\`\`\`

---

## Step 8: Common Issues

### Issue: "NEXTAUTH_SECRET is not set"
- Add NEXTAUTH_SECRET to environment variables
- Restart dev server

### Issue: "Google sign in not working"
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
- Check redirect URIs are added in Google Console
- Clear browser cookies and try again

### Issue: "Password not hashing"
- Verify bcryptjs is installed: `npm list bcryptjs`
- Check password is being hashed in sign up route

### Issue: "Session not persisting"
- Check NEXTAUTH_SECRET is set
- Verify JWT strategy is configured
- Clear browser cookies

---

## Step 9: Production Deployment

### 9.1 Update NEXTAUTH_URL
Change from `http://localhost:3000` to your production domain:
\`\`\`
NEXTAUTH_URL=https://yourdomain.com
\`\`\`

### 9.2 Update Google OAuth
Add production redirect URI in Google Console:
\`\`\`
https://yourdomain.com/api/auth/callback/google
\`\`\`

### 9.3 Deploy to Vercel
1. Push code to GitHub
2. Connect to Vercel
3. Add all environment variables
4. Deploy

---

## Next Steps

✅ NextAuth is now set up!

You can now:
1. Sign up new users
2. Sign in with email/password
3. Sign in with Google
4. Protect routes based on authentication
5. Check user roles (STUDENT, INSTRUCTOR, ADMIN)

For more info: https://next-auth.js.org/
