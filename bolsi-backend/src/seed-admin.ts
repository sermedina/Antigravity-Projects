import { AppDataSource } from './config/data-source';
import { User } from './entities/User';
import { Role } from './entities/Role';
import * as bcrypt from 'bcrypt';

async function main() {
  await AppDataSource.initialize();
  console.log('DB initialized');

  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  // 1. Roles
  let adminRole = await roleRepo.findOneBy({ name: 'SYSTEM_ADMIN' });
  if (!adminRole) {
    adminRole = roleRepo.create({ name: 'SYSTEM_ADMIN' });
    await roleRepo.save(adminRole);
  }

  let managerRole = await roleRepo.findOneBy({ name: 'CONTENT_MANAGER' });
  if (!managerRole) {
    managerRole = roleRepo.create({ name: 'CONTENT_MANAGER' });
    await roleRepo.save(managerRole);
  }

  let userRole = await roleRepo.findOneBy({ name: 'APP_USER' });
  if (!userRole) {
    userRole = roleRepo.create({ name: 'APP_USER' });
    await roleRepo.save(userRole);
  }

  // 2. Admin User
  const existingAdmin = await userRepo.findOneBy({ username: 'admin' });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Password123', 10);
    const admin = userRepo.create({
      username: 'admin',
      email: 'admin@bolsi.com',
      is_email_verified: true,
      password_hash: passwordHash,
      first_name: 'System',
      last_name: 'Admin',
      phone: '+15550100',
      is_phone_verified: true,
      country: 'USA',
      city: 'New York',
      user_type: 'NATURAL',
      is_active: true,
      roles: [adminRole]
    });
    await userRepo.save(admin);
    console.log('SYSTEM_ADMIN user seeded: admin / Password123');
  } else {
    console.log('SYSTEM_ADMIN user already exists');
  }

  // 3. Content Manager User
  const existingManager = await userRepo.findOneBy({ username: 'manager' });
  if (!existingManager) {
    const passwordHash = await bcrypt.hash('Password123', 10);
    const manager = userRepo.create({
      username: 'manager',
      email: 'manager@bolsi.com',
      is_email_verified: true,
      password_hash: passwordHash,
      first_name: 'Content',
      last_name: 'Manager',
      phone: '+15550200',
      is_phone_verified: true,
      country: 'USA',
      city: 'New York',
      user_type: 'NATURAL',
      is_active: true,
      roles: [managerRole]
    });
    await userRepo.save(manager);
    console.log('CONTENT_MANAGER user seeded: manager / Password123');
  } else {
    console.log('CONTENT_MANAGER user already exists');
  }

  await AppDataSource.destroy();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
