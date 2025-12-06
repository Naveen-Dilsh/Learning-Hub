const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.videoProgress.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  console.log('👥 Creating users...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      email: 'john.instructor@example.com',
      name: 'John Instructor',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: 'sarah.teacher@example.com',
      name: 'Sarah Teacher',
      password: hashedPassword,
      role: 'INSTRUCTOR',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      name: 'Alice Student',
      password: hashedPassword,
      role: 'STUDENT',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      name: 'Bob Learner',
      password: hashedPassword,
      role: 'STUDENT',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'student3@example.com',
      name: 'Charlie Student',
      password: hashedPassword,
      role: 'STUDENT',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
    },
  });

  // Create Courses
  console.log('📚 Creating courses...');
  const course1 = await prisma.course.create({
    data: {
      title: 'Complete Web Development Bootcamp',
      description: 'Learn HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and become a full-stack developer.',
      price: 15000.00,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      instructorId: instructor1.id,
      published: true,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Python for Data Science and Machine Learning',
      description: 'Master Python programming, data analysis with Pandas, visualization with Matplotlib, and machine learning with scikit-learn.',
      price: 18000.00,
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      instructorId: instructor1.id,
      published: true,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'UI/UX Design Masterclass',
      description: 'Learn user interface and user experience design principles, Figma, prototyping, and design thinking.',
      price: 12000.00,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      instructorId: instructor2.id,
      published: true,
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile applications for iOS and Android using React Native and JavaScript.',
      price: 16000.00,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      instructorId: instructor2.id,
      published: true,
    },
  });

  const course5 = await prisma.course.create({
    data: {
      title: 'Advanced JavaScript & TypeScript',
      description: 'Deep dive into JavaScript ES6+, TypeScript, async programming, and modern development patterns.',
      price: 14000.00,
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800',
      instructorId: instructor1.id,
      published: false, // Unpublished course
    },
  });

  // Create Videos for Course 1
  console.log('🎥 Creating videos...');
  const course1Videos = await Promise.all([
    prisma.video.create({
      data: {
        title: 'Introduction to Web Development',
        description: 'Overview of web development, tools, and what you will learn',
        courseId: course1.id,
        cloudflareStreamId: 'demo-stream-id-001',
        duration: 600, // 10 minutes
        order: 1,
      },
    }),
    prisma.video.create({
      data: {
        title: 'HTML Basics',
        description: 'Learn HTML tags, elements, and structure',
        courseId: course1.id,
        cloudflareStreamId: 'demo-stream-id-002',
        duration: 1800, // 30 minutes
        order: 2,
      },
    }),
    prisma.video.create({
      data: {
        title: 'CSS Fundamentals',
        description: 'Styling web pages with CSS',
        courseId: course1.id,
        cloudflareStreamId: 'demo-stream-id-003',
        duration: 2400, // 40 minutes
        order: 3,
      },
    }),
    prisma.video.create({
      data: {
        title: 'JavaScript Introduction',
        description: 'Programming fundamentals with JavaScript',
        courseId: course1.id,
        cloudflareStreamId: 'demo-stream-id-004',
        duration: 3000, // 50 minutes
        order: 4,
      },
    }),
  ]);

  // Create Videos for Course 2
  await Promise.all([
    prisma.video.create({
      data: {
        title: 'Python Setup and Basics',
        description: 'Installing Python and learning basic syntax',
        courseId: course2.id,
        cloudflareStreamId: 'demo-stream-id-005',
        duration: 900,
        order: 1,
      },
    }),
    prisma.video.create({
      data: {
        title: 'NumPy and Pandas',
        description: 'Data manipulation with NumPy and Pandas',
        courseId: course2.id,
        cloudflareStreamId: 'demo-stream-id-006',
        duration: 2700,
        order: 2,
      },
    }),
    prisma.video.create({
      data: {
        title: 'Data Visualization',
        description: 'Creating charts with Matplotlib and Seaborn',
        courseId: course2.id,
        cloudflareStreamId: 'demo-stream-id-007',
        duration: 2100,
        order: 3,
      },
    }),
  ]);

  // Create Videos for Course 3
  await Promise.all([
    prisma.video.create({
      data: {
        title: 'Design Thinking Process',
        description: 'Understanding the design thinking methodology',
        courseId: course3.id,
        cloudflareStreamId: 'demo-stream-id-008',
        duration: 1200,
        order: 1,
      },
    }),
    prisma.video.create({
      data: {
        title: 'Figma Basics',
        description: 'Getting started with Figma design tool',
        courseId: course3.id,
        cloudflareStreamId: 'demo-stream-id-009',
        duration: 1800,
        order: 2,
      },
    }),
  ]);

  // Create Enrollments
  console.log('📝 Creating enrollments...');
  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: course2.id,
    },
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      courseId: course1.id,
    },
  });

  const enrollment4 = await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      courseId: course3.id,
      completedAt: new Date(), // Completed course
    },
  });

  const enrollment5 = await prisma.enrollment.create({
    data: {
      studentId: student3.id,
      courseId: course2.id,
    },
  });

  // Create Video Progress
  console.log('📊 Creating video progress...');
  await prisma.videoProgress.create({
    data: {
      enrollmentId: enrollment1.id,
      videoId: course1Videos[0].id,
      completed: true,
      completedAt: new Date(),
    },
  });

  await prisma.videoProgress.create({
    data: {
      enrollmentId: enrollment1.id,
      videoId: course1Videos[1].id,
      completed: true,
      completedAt: new Date(),
    },
  });

  await prisma.videoProgress.create({
    data: {
      enrollmentId: enrollment1.id,
      videoId: course1Videos[2].id,
      completed: false,
    },
  });

  // Create Payments
  console.log('💳 Creating payments...');
  await prisma.payment.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
      amount: 15000.00,
      currency: 'LKR',
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      payHereOrderId: 'ORDER123456',
      payHerePaymentId: 'PAY123456',
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student1.id,
      courseId: course2.id,
      amount: 18000.00,
      currency: 'LKR',
      status: 'COMPLETED',
      paymentMethod: 'CARD',
      payHereOrderId: 'ORDER123457',
      payHerePaymentId: 'PAY123457',
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student2.id,
      courseId: course1.id,
      amount: 15000.00,
      currency: 'LKR',
      status: 'COMPLETED',
      paymentMethod: 'BANK_TRANSFER',
      payHereOrderId: 'ORDER123458',
      payHerePaymentId: 'PAY123458',
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student3.id,
      courseId: course2.id,
      amount: 18000.00,
      currency: 'LKR',
      status: 'PENDING',
      paymentMethod: 'CARD',
      payHereOrderId: 'ORDER123459',
    },
  });

  await prisma.payment.create({
    data: {
      studentId: student3.id,
      courseId: course4.id,
      amount: 16000.00,
      currency: 'LKR',
      status: 'FAILED',
      paymentMethod: 'CARD',
      payHereOrderId: 'ORDER123460',
    },
  });

  // Create Reviews
  console.log('⭐ Creating reviews...');
  await prisma.review.create({
    data: {
      studentId: student1.id,
      courseId: course1.id,
      rating: 5,
      comment: 'Excellent course! Very comprehensive and well-explained. Highly recommend!',
    },
  });

  await prisma.review.create({
    data: {
      studentId: student2.id,
      courseId: course1.id,
      rating: 4,
      comment: 'Great content and good instructor. Would have liked more practical projects.',
    },
  });

  await prisma.review.create({
    data: {
      studentId: student2.id,
      courseId: course3.id,
      rating: 5,
      comment: 'Amazing design course! Sarah is a fantastic teacher. Learned so much about UI/UX.',
    },
  });

  await prisma.review.create({
    data: {
      studentId: student1.id,
      courseId: course2.id,
      rating: 5,
      comment: 'Best Python course I have taken. Clear explanations and great examples.',
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Courses: ${await prisma.course.count()}`);
  console.log(`   Videos: ${await prisma.video.count()}`);
  console.log(`   Enrollments: ${await prisma.enrollment.count()}`);
  console.log(`   Payments: ${await prisma.payment.count()}`);
  console.log(`   Reviews: ${await prisma.review.count()}`);
  console.log(`   Video Progress: ${await prisma.videoProgress.count()}`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   Instructor 1: john.instructor@example.com / password123');
  console.log('   Instructor 2: sarah.teacher@example.com / password123');
  console.log('   Student 1: student1@example.com / password123');
  console.log('   Student 2: student2@example.com / password123');
  console.log('   Student 3: student3@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
