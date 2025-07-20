import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  console.log('🌱 Seeding super admin user...');

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@construction.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin123456';
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: superAdminEmail,
        role: 'SUPER_ADMIN'
      }
    });

    if (existingSuperAdmin) {
      console.log('⏭️  Super admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    // Create super admin user
    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        name: superAdminName,
        role: 'SUPER_ADMIN',
        companyId: null, // Super admin is not associated with any company
        isActive: true
      }
    });

    console.log('✅ Super admin user created successfully');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`🔑 Password: ${superAdminPassword}`);
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedSuperAdmin();
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedSuperAdmin };