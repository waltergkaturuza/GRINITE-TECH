import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserStatus } from './src/users/entities/user.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  entities: [User],
  ssl: { rejectUnauthorized: false },
  synchronize: true, // This will create tables automatically
});

async function createAdminUser() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connection established');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@granitetech.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email: admin@granitetech.com');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('GraniteTech2024!', 12);

    // Create admin user
    const adminUser = userRepository.create({
      email: 'admin@granitetech.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1234567890',
      company: 'GRANITE TECH',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      twoFactorEnabled: false,
    });

    await userRepository.save(adminUser);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@granitetech.com');
    console.log('🔑 Password: GraniteTech2024!');
    console.log('👑 Role: admin');
    console.log('');
    console.log('🎉 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('📦 Database connection closed');
  }
}

// Run the seeder
createAdminUser();