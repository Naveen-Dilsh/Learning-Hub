# Prisma Database Setup - Step by Step

## What is Prisma?
Prisma is an ORM (Object-Relational Mapping) tool that makes it easy to work with databases in Node.js. It provides:
- Type-safe database queries
- Automatic migrations
- Visual database explorer (Prisma Studio)
- Easy schema management

---

## Step 1: Verify Prisma Installation

Check if Prisma is already installed:
\`\`\`bash
npx prisma --version
\`\`\`

You should see version 5.7.0 or higher.

---

## Step 2: Verify Your Database Connection

### 2.1 Check NEON_DATABASE_URL Environment Variable
Make sure your `DATABASE_URL` is set in the v0 Vars section:
\`\`\`
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
\`\`\`

### 2.2 Test Connection
\`\`\`bash
npx prisma db execute --stdin < /dev/null
\`\`\`

If this works without errors, your connection is good!

---

## Step 3: Generate Prisma Client

The Prisma Client is the tool you use to query your database in your code.

\`\`\`bash
npx prisma generate
\`\`\`

This creates the `node_modules/.prisma/client` directory with all the generated code.

---

## Step 4: Create Database Tables (Run Migrations)

### 4.1 First Time Setup
If this is your first time, run:
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

This will:
1. Create all tables defined in `prisma/schema.prisma`
2. Generate migration files
3. Generate Prisma Client

### 4.2 Subsequent Changes
If you modify the schema later:
\`\`\`bash
npx prisma migrate dev --name describe_your_change
\`\`\`

Example:
\`\`\`bash
npx prisma migrate dev --name add_course_category
\`\`\`

---

## Step 5: Verify Tables Were Created

### 5.1 Using Prisma Studio (Visual Explorer)
\`\`\`bash
npx prisma studio
\`\`\`

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- See all records
- Add/edit/delete data
- Test queries

### 5.2 Using SQL Query
Connect to your Neon database and run:
\`\`\`sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
\`\`\`

You should see these tables:
- `User`
- `Course`
- `Video`
- `Enrollment`
- `VideoProgress`
- `Payment`
- `Review`

---

## Step 6: Seed Initial Data

### 6.1 Run Seed Script
\`\`\`bash
npm run seed
\`\`\`

This creates:
- Admin user (admin@smartlearn.com / admin123)
- Instructor user (instructor@smartlearn.com / instructor123)
- Student user (student@smartlearn.com / student123)
- Sample course
- Sample video
- Sample enrollment

### 6.2 Verify Seed Data
Open Prisma Studio and check the User table:
\`\`\`bash
npx prisma studio
\`\`\`

You should see 3 users created.

---

## Step 7: Understanding the Schema

### 7.1 Key Models

**User Model**
- Stores user information (email, name, password)
- Has role: STUDENT, INSTRUCTOR, or ADMIN
- Relations: courses (as instructor), enrollments, payments, reviews

**Course Model**
- Stores course information (title, description, price)
- Belongs to an instructor
- Relations: videos, enrollments, reviews, payments

**Video Model**
- Stores video information
- Belongs to a course
- Stores Cloudflare Stream video ID
- Relations: progress tracking

**Enrollment Model**
- Tracks which students are enrolled in which courses
- Unique constraint: one enrollment per student per course
- Relations: video progress

**Payment Model**
- Stores payment information
- Tracks PayHere transaction IDs
- Status: PENDING, COMPLETED, FAILED, CANCELLED

**Review Model**
- Stores course reviews and ratings
- Unique constraint: one review per student per course

---

## Step 8: Common Prisma Commands

### Query Examples

**Get all users:**
\`\`\`javascript
const users = await prisma.user.findMany();
\`\`\`

**Get user by email:**
\`\`\`javascript
const user = await prisma.user.findUnique({
  where: { email: "student@smartlearn.com" }
});
\`\`\`

**Create a new course:**
\`\`\`javascript
const course = await prisma.course.create({
  data: {
    title: "My Course",
    description: "Course description",
    price: 4999,
    instructorId: "instructor-id",
    published: true
  }
});
\`\`\`

**Get course with videos:**
\`\`\`javascript
const course = await prisma.course.findUnique({
  where: { id: "course-id" },
  include: { videos: true }
});
\`\`\`

**Get student enrollments:**
\`\`\`javascript
const enrollments = await prisma.enrollment.findMany({
  where: { studentId: "student-id" },
  include: { course: true }
});
\`\`\`

---

## Step 9: Troubleshooting

### Error: "Can't reach database server"
- Check DATABASE_URL is correct
- Verify Neon database is running
- Check firewall/network settings

### Error: "relation does not exist"
- Run migrations: `npx prisma migrate dev`
- Check schema.prisma for syntax errors

### Error: "Unique constraint failed"
- You're trying to create a duplicate record
- Check for existing records first

### Prisma Client not found
- Run: `npx prisma generate`
- Delete node_modules and reinstall: `npm install`

---

## Step 10: Production Deployment

### 10.1 Deploy to Vercel
1. Push code to GitHub
2. Connect to Vercel
3. Add DATABASE_URL to environment variables
4. Deploy

### 10.2 Run Migrations on Production
\`\`\`bash
npx prisma migrate deploy
\`\`\`

This runs all pending migrations without creating new ones.

---

## Next Steps

✅ Prisma is now set up and connected to your Neon database!

Now you can:
1. Start your dev server: `npm run dev`
2. Test API endpoints
3. Create courses and enroll students
4. Process payments
5. Deploy to production

For more info: https://www.prisma.io/docs/
