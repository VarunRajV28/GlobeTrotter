import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error('❌ User not found with email:', email);
      console.log('\n💡 Available users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true },
      });
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name}) - Role: ${u.role}`);
      });
      return;
    }

    if (user.role === 'ADMIN') {
      console.log('✅ User is already an admin!');
      return;
    }

    // Update user to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log('✅ Successfully updated user to ADMIN!');
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'venkatesh.k21062005@gmail.com';
makeUserAdmin(email);
