import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin user
  const superAdminPassword = await bcrypt.hash('admin123456', 12);
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@construction.com' },
    update: {},
    create: {
      email: 'admin@construction.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      language: 'ENGLISH',
      companyId: null, // Super admin is not associated with any company
    },
  });

  console.log('✅ Super admin user created');

  // Create regular admin user (for legacy support)
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin2@construction.com' },
    update: {},
    create: {
      email: 'admin2@construction.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      language: 'ENGLISH',
    },
  });

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@construction.com' },
    update: {},
    create: {
      email: 'manager@construction.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'MANAGER',
      language: 'ENGLISH',
    },
  });

  console.log('✅ Users created');

  // Create machines
  const machines = await Promise.all([
    prisma.machine.upsert({
      where: { id: 'machine-1' },
      update: {},
      create: {
        id: 'machine-1',
        name: 'Excavator-001',
        type: 'EXCAVATOR',
        model: 'CAT 320',
        year: 2020,
        capacity: '20 tons',
        description: 'Heavy duty excavator for large projects',
        isAvailable: true,
        dailyRate: 800,
        hourlyRate: 100,
      },
    }),
    prisma.machine.upsert({
      where: { id: 'machine-2' },
      update: {},
      create: {
        id: 'machine-2',
        name: 'Bulldozer-001',
        type: 'BULLDOZER',
        model: 'CAT D6',
        year: 2019,
        capacity: '15 tons',
        description: 'Track-type bulldozer for earthmoving',
        isAvailable: true,
        dailyRate: 600,
        hourlyRate: 75,
      },
    }),
    prisma.machine.upsert({
      where: { id: 'machine-3' },
      update: {},
      create: {
        id: 'machine-3',
        name: 'Crane-001',
        type: 'CRANE',
        model: 'Liebherr LTM 1100',
        year: 2021,
        capacity: '100 tons',
        description: 'Mobile crane for heavy lifting',
        isAvailable: false,
        dailyRate: 1200,
        hourlyRate: 150,
      },
    }),
  ]);

  console.log('✅ Machines created');

  // Create drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { id: 'driver-1' },
      update: {},
      create: {
        id: 'driver-1',
        name: 'John Doe',
        phone: '+1 (555) 123-4567',
        licenseNumber: 'DL-123456',
        experience: 8,
        salary: 3500,
        isActive: true,
      },
    }),
    prisma.driver.upsert({
      where: { id: 'driver-2' },
      update: {},
      create: {
        id: 'driver-2',
        name: 'Jane Smith',
        phone: '+1 (555) 987-6543',
        licenseNumber: 'DL-789012',
        experience: 5,
        salary: 3200,
        isActive: true,
      },
    }),
    prisma.driver.upsert({
      where: { id: 'driver-3' },
      update: {},
      create: {
        id: 'driver-3',
        name: 'Mike Johnson',
        phone: '+1 (555) 456-7890',
        licenseNumber: 'DL-345678',
        experience: 12,
        salary: 4000,
        isActive: true,
        isOnVacation: true,
        vacationStartDate: new Date('2024-02-01'),
        vacationEndDate: new Date('2024-02-15'),
      },
    }),
  ]);

  console.log('✅ Drivers created');

  // Create driver assistants
  const assistants = await Promise.all([
    prisma.driverAssistant.upsert({
      where: { id: 'assistant-1' },
      update: {},
      create: {
        id: 'assistant-1',
        name: 'Bob Wilson',
        phone: '+1 (555) 111-2222',
        experience: 3,
        salary: 2500,
        isActive: true,
      },
    }),
    prisma.driverAssistant.upsert({
      where: { id: 'assistant-2' },
      update: {},
      create: {
        id: 'assistant-2',
        name: 'Alice Brown',
        phone: '+1 (555) 333-4444',
        experience: 2,
        salary: 2300,
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Driver assistants created');

  // Create contracts
  const contracts = await Promise.all([
    prisma.contract.upsert({
      where: { id: 'contract-1' },
      update: {},
      create: {
        id: 'contract-1',
        title: 'Highway Construction Project',
        description: 'Major highway construction project in downtown area',
        clientName: 'ABC Construction Co.',
        clientPhone: '+1 (555) 999-8888',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        totalAmount: 500000,
        status: 'ACTIVE',
        createdById: adminUser.id,
      },
    }),
    prisma.contract.upsert({
      where: { id: 'contract-2' },
      update: {},
      create: {
        id: 'contract-2',
        title: 'Residential Complex Development',
        description: 'Construction of 50-unit residential complex',
        clientName: 'XYZ Developers',
        clientPhone: '+1 (555) 777-6666',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        totalAmount: 300000,
        status: 'ACTIVE',
        createdById: managerUser.id,
      },
    }),
  ]);

  console.log('✅ Contracts created');

  // Create contract machines
  await Promise.all([
    prisma.contractMachine.upsert({
      where: { id: 'cm-1' },
      update: {},
      create: {
        id: 'cm-1',
        contractId: 'contract-1',
        machineId: 'machine-1',
        requiredHoursPerDay: 8,
        totalHoursPerMonth: 200,
        dailyRate: 800,
      },
    }),
    prisma.contractMachine.upsert({
      where: { id: 'cm-2' },
      update: {},
      create: {
        id: 'cm-2',
        contractId: 'contract-1',
        machineId: 'machine-2',
        requiredHoursPerDay: 6,
        totalHoursPerMonth: 150,
        dailyRate: 600,
      },
    }),
    prisma.contractMachine.upsert({
      where: { id: 'cm-3' },
      update: {},
      create: {
        id: 'cm-3',
        contractId: 'contract-2',
        machineId: 'machine-3',
        requiredHoursPerDay: 10,
        totalHoursPerMonth: 250,
        dailyRate: 1200,
      },
    }),
  ]);

  console.log('✅ Contract machines created');

  // Create machine assignments
  await Promise.all([
    prisma.machineAssignment.upsert({
      where: { id: 'ma-1' },
      update: {},
      create: {
        id: 'ma-1',
        machineId: 'machine-1',
        driverId: 'driver-1',
        assistantId: 'assistant-1',
        startDate: new Date('2024-01-01'),
        isActive: true,
      },
    }),
    prisma.machineAssignment.upsert({
      where: { id: 'ma-2' },
      update: {},
      create: {
        id: 'ma-2',
        machineId: 'machine-2',
        driverId: 'driver-2',
        assistantId: 'assistant-2',
        startDate: new Date('2024-01-01'),
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Machine assignments created');

  // Create machine hours
  await Promise.all([
    prisma.machineHour.upsert({
      where: { id: 'mh-1' },
      update: {},
      create: {
        id: 'mh-1',
        machineId: 'machine-1',
        date: new Date('2024-02-25'),
        hoursWorked: 8.5,
        requiredHours: 8,
        extraHours: 0.5,
        notes: 'Standard working day',
      },
    }),
    prisma.machineHour.upsert({
      where: { id: 'mh-2' },
      update: {},
      create: {
        id: 'mh-2',
        machineId: 'machine-2',
        date: new Date('2024-02-25'),
        hoursWorked: 6,
        requiredHours: 6,
        extraHours: 0,
        notes: 'Completed early',
      },
    }),
  ]);

  console.log('✅ Machine hours created');

  // Create lands
  const lands = await Promise.all([
    prisma.land.upsert({
      where: { id: 'land-1' },
      update: {},
      create: {
        id: 'land-1',
        name: 'Commercial Land Plot A',
        location: 'Downtown Business District',
        size: 5000,
        description: 'Prime commercial land in downtown area',
        isAvailable: false,
        monthlyRent: 5000,
      },
    }),
    prisma.land.upsert({
      where: { id: 'land-2' },
      update: {},
      create: {
        id: 'land-2',
        name: 'Industrial Land Plot B',
        location: 'Industrial Zone',
        size: 10000,
        description: 'Large industrial land for manufacturing',
        isAvailable: true,
        monthlyRent: 8000,
      },
    }),
  ]);

  console.log('✅ Lands created');

  // Create rooms
  const rooms = await Promise.all([
    prisma.room.upsert({
      where: { id: 'room-1' },
      update: {},
      create: {
        id: 'room-1',
        name: 'Office Room 101',
        building: 'Business Center',
        floor: 1,
        roomNumber: '101',
        size: 800,
        description: 'Modern office space with amenities',
        isAvailable: true,
        monthlyRent: 2000,
      },
    }),
    prisma.room.upsert({
      where: { id: 'room-2' },
      update: {},
      create: {
        id: 'room-2',
        name: 'Conference Room 201',
        building: 'Business Center',
        floor: 2,
        roomNumber: '201',
        size: 1200,
        description: 'Large conference room with AV equipment',
        isAvailable: false,
        monthlyRent: 3000,
      },
    }),
  ]);

  console.log('✅ Rooms created');

  // Create land rentals
  await prisma.landRental.upsert({
    where: { id: 'lr-1' },
    update: {},
    create: {
      id: 'lr-1',
      landId: 'land-1',
      tenantName: 'John Smith',
      tenantPhone: '+1 (555) 123-4567',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyRent: 5000,
      advancePayments: 10000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Land rentals created');

  // Create room rentals
  await prisma.roomRental.upsert({
    where: { id: 'rr-1' },
    update: {},
    create: {
      id: 'rr-1',
      roomId: 'room-2',
      tenantName: 'ABC Corporation',
      tenantPhone: '+1 (555) 999-8888',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyRent: 3000,
      advancePayments: 6000,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Room rentals created');

  // Create payments
  await Promise.all([
    prisma.payment.upsert({
      where: { id: 'payment-1' },
      update: {},
      create: {
        id: 'payment-1',
        amount: 50000,
        type: 'CONTRACT',
        description: 'Advance payment for highway construction project',
        date: new Date('2024-01-01'),
        contractId: 'contract-1',
        createdById: adminUser.id,
      },
    }),
    prisma.payment.upsert({
      where: { id: 'payment-2' },
      update: {},
      create: {
        id: 'payment-2',
        amount: 5000,
        type: 'RENT',
        description: 'Monthly rent for Commercial Land Plot A',
        date: new Date('2024-02-01'),
        landRentalId: 'lr-1',
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Payments created');

  // Create salary payments
  await Promise.all([
    prisma.salaryPayment.upsert({
      where: { id: 'sp-1' },
      update: {},
      create: {
        id: 'sp-1',
        amount: 3500,
        month: 1,
        year: 2024,
        driverId: 'driver-1',
        createdById: adminUser.id,
      },
    }),
    prisma.salaryPayment.upsert({
      where: { id: 'sp-2' },
      update: {},
      create: {
        id: 'sp-2',
        amount: 3200,
        month: 1,
        year: 2024,
        driverId: 'driver-2',
        createdById: adminUser.id,
      },
    }),
  ]);

  console.log('✅ Salary payments created');

  // Create alerts
  await Promise.all([
    prisma.alert.upsert({
      where: { id: 'alert-1' },
      update: {},
      create: {
        id: 'alert-1',
        title: 'Rent Payment Due',
        message: 'Rent payment of $5,000 is due for Commercial Land Plot A on March 1, 2024',
        type: 'RENT_DUE',
        priority: 'HIGH',
        dueDate: new Date('2024-03-01'),
        isActive: true,
      },
    }),
    prisma.alert.upsert({
      where: { id: 'alert-2' },
      update: {},
      create: {
        id: 'alert-2',
        title: 'Machine Maintenance Required',
        message: 'Excavator-001 requires scheduled maintenance. Last service was 3 months ago.',
        type: 'MAINTENANCE',
        priority: 'MEDIUM',
        dueDate: new Date('2024-03-15'),
        isActive: true,
      },
    }),
    prisma.alert.upsert({
      where: { id: 'alert-3' },
      update: {},
      create: {
        id: 'alert-3',
        title: 'Contract Deadline Approaching',
        message: 'Highway construction project contract ends on March 31, 2024. 80% completion achieved.',
        type: 'CONTRACT_EXPIRY',
        priority: 'CRITICAL',
        dueDate: new Date('2024-03-31'),
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Alerts created');

  // Create driver account
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@construction.com' },
    update: {},
    create: {
      email: 'driver@construction.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'USER',
      language: 'ENGLISH',
    },
  });

  await prisma.driverAccount.upsert({
    where: { driverId: 'driver-1' },
    update: {},
    create: {
      userId: driverUser.id,
      driverId: 'driver-1',
      startDate: new Date('2024-01-01'),
      totalWorkingDays: 45,
      totalLeaveDays: 5,
      netWorkingDays: 40,
      totalSalaryEarned: 4666.67,
      totalSalaryPaid: 3500,
      remainingSalary: 1166.67,
    },
  });

  // Create assistant account
  const assistantUser = await prisma.user.upsert({
    where: { email: 'assistant@construction.com' },
    update: {},
    create: {
      email: 'assistant@construction.com',
      password: hashedPassword,
      name: 'Bob Wilson',
      role: 'USER',
      language: 'ENGLISH',
    },
  });

  await prisma.assistantAccount.upsert({
    where: { assistantId: 'assistant-1' },
    update: {},
    create: {
      userId: assistantUser.id,
      assistantId: 'assistant-1',
      startDate: new Date('2024-01-15'),
      totalWorkingDays: 35,
      totalLeaveDays: 2,
      netWorkingDays: 33,
      totalSalaryEarned: 2750,
      totalSalaryPaid: 2000,
      remainingSalary: 750,
    },
  });

  // Create tenant account
  const tenantUser = await prisma.user.upsert({
    where: { email: 'tenant@construction.com' },
    update: {},
    create: {
      email: 'tenant@construction.com',
      password: hashedPassword,
      name: 'John Smith',
      role: 'USER',
      language: 'ENGLISH',
    },
  });

  await prisma.tenantAccount.upsert({
    where: { userId: tenantUser.id },
    update: {},
    create: {
      userId: tenantUser.id,
      tenantName: 'John Smith',
      tenantPhone: '+1 (555) 123-4567',
      rentalType: 'LAND',
      rentalId: 'lr-1',
      startDate: new Date('2024-01-01'),
      monthlyRent: 5000,
      totalRentDue: 10000,
      totalRentPaid: 5000,
      remainingRent: 5000,
      advancePayments: 10000,
    },
  });

  // Create machine parker account
  const parkerUser = await prisma.user.upsert({
    where: { email: 'parker@construction.com' },
    update: {},
    create: {
      email: 'parker@construction.com',
      password: hashedPassword,
      name: 'Mike Johnson',
      role: 'USER',
      language: 'ENGLISH',
    },
  });

  await prisma.machineParkerAccount.upsert({
    where: { userId: parkerUser.id },
    update: {},
    create: {
      userId: parkerUser.id,
      parkerName: 'Mike Johnson',
      parkerPhone: '+1 (555) 987-6543',
      landId: 'land-2',
      startDate: new Date('2024-02-01'),
      totalMachines: 3,
      farePerMachine: 500,
      totalFareDue: 1500,
      totalFarePaid: 1000,
      remainingFare: 500,
    },
  });

  // Create leave records
  await Promise.all([
    prisma.leaveRecord.upsert({
      where: { id: 'leave-1' },
      update: {},
      create: {
        id: 'leave-1',
        driverId: 'driver-1',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-05'),
        leaveType: 'VACATION',
        reason: 'Family vacation',
        isApproved: true,
      },
    }),
    prisma.leaveRecord.upsert({
      where: { id: 'leave-2' },
      update: {},
      create: {
        id: 'leave-2',
        assistantId: 'assistant-1',
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-11'),
        leaveType: 'SICK',
        reason: 'Not feeling well',
        isApproved: true,
      },
    }),
  ]);

  console.log('✅ User accounts created');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });