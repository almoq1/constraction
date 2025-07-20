import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import moment from 'moment';

export const setupCronJobs = () => {
  console.log('🕐 Setting up cron jobs...');

  // Daily rent due check - runs at 9 AM every day
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running daily rent due check...');
    await checkRentDue();
  });

  // Daily contract expiry check - runs at 10 AM every day
  cron.schedule('0 10 * * *', async () => {
    console.log('📋 Running daily contract expiry check...');
    await checkContractExpiry();
  });

  // Daily salary due check - runs at 11 AM every day
  cron.schedule('0 11 * * *', async () => {
    console.log('💰 Running daily salary due check...');
    await checkSalaryDue();
  });

  // Weekly system cleanup - runs every Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Running weekly system cleanup...');
    await systemCleanup();
  });

  // Monthly financial summary - runs on the 1st of every month at 6 AM
  cron.schedule('0 6 1 * *', async () => {
    console.log('📊 Running monthly financial summary...');
    await generateMonthlySummary();
  });
};

// Check for rent due alerts
const checkRentDue = async () => {
  try {
    const today = new Date();
    const nextWeek = moment().add(7, 'days').toDate();

    // Check land rentals
    const landRentals = await prisma.landRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: nextWeek
        }
      },
      include: {
        land: true
      }
    });

    // Check room rentals
    const roomRentals = await prisma.roomRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: nextWeek
        }
      },
      include: {
        room: true
      }
    });

    // Create alerts for land rentals
    for (const rental of landRentals) {
      const daysUntilDue = moment(rental.endDate).diff(moment(), 'days');
      
      if (daysUntilDue <= 7) {
        const priority = daysUntilDue <= 3 ? 'HIGH' : daysUntilDue <= 5 ? 'MEDIUM' : 'LOW';
        
        await prisma.alert.create({
          data: {
            type: 'RENT_DUE',
            title: `Land Rent Due: ${rental.land.name}`,
            message: `Rent for ${rental.land.name} is due in ${daysUntilDue} days. Tenant: ${rental.tenantName}. Amount: ${rental.monthlyRent}`,
            priority
          }
        });
      }
    }

    // Create alerts for room rentals
    for (const rental of roomRentals) {
      const daysUntilDue = moment(rental.endDate).diff(moment(), 'days');
      
      if (daysUntilDue <= 7) {
        const priority = daysUntilDue <= 3 ? 'HIGH' : daysUntilDue <= 5 ? 'MEDIUM' : 'LOW';
        
        await prisma.alert.create({
          data: {
            type: 'RENT_DUE',
            title: `Room Rent Due: ${rental.room.name}`,
            message: `Rent for ${rental.room.name} is due in ${daysUntilDue} days. Tenant: ${rental.tenantName}. Amount: ${rental.monthlyRent}`,
            priority
          }
        });
      }
    }

    console.log(`✅ Rent due check completed. Created alerts for ${landRentals.length + roomRentals.length} rentals.`);
  } catch (error) {
    console.error('❌ Error in rent due check:', error);
  }
};

// Check for contract expiry alerts
const checkContractExpiry = async () => {
  try {
    const today = new Date();
    const nextMonth = moment().add(30, 'days').toDate();

    const contracts = await prisma.contract.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: nextMonth
        }
      }
    });

    for (const contract of contracts) {
      const daysUntilExpiry = moment(contract.endDate).diff(moment(), 'days');
      
      if (daysUntilExpiry <= 30) {
        const priority = daysUntilExpiry <= 7 ? 'HIGH' : daysUntilExpiry <= 14 ? 'MEDIUM' : 'LOW';
        
        await prisma.alert.create({
          data: {
            type: 'CONTRACT_EXPIRY',
            title: `Contract Expiring: ${contract.title}`,
            message: `Contract "${contract.title}" with ${contract.clientName} expires in ${daysUntilExpiry} days. Total amount: ${contract.totalAmount}`,
            priority
          }
        });
      }
    }

    console.log(`✅ Contract expiry check completed. Created alerts for ${contracts.length} contracts.`);
  } catch (error) {
    console.error('❌ Error in contract expiry check:', error);
  }
};

// Check for salary due alerts
const checkSalaryDue = async () => {
  try {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Check drivers
    const drivers = await prisma.driver.findMany({
      where: { isActive: true },
      include: {
        salaryPayments: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }
      }
    });

    // Check assistants
    const assistants = await prisma.driverAssistant.findMany({
      where: { isActive: true },
      include: {
        salaryPayments: {
          where: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }
      }
    });

    let alertCount = 0;

    // Process drivers
    for (const driver of drivers) {
      const totalPaid = driver.salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingSalary = driver.salary - totalPaid;
      
      if (remainingSalary > 0) {
        const priority = remainingSalary > driver.salary * 0.5 ? 'HIGH' : 'MEDIUM';
        
        await prisma.alert.create({
          data: {
            type: 'SALARY_DUE',
            title: `Salary Due: ${driver.name}`,
            message: `Driver ${driver.name} has ${remainingSalary.toFixed(2)} remaining salary for this month. Total salary: ${driver.salary}`,
            priority
          }
        });
        alertCount++;
      }
    }

    // Process assistants
    for (const assistant of assistants) {
      const totalPaid = assistant.salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingSalary = assistant.salary - totalPaid;
      
      if (remainingSalary > 0) {
        const priority = remainingSalary > assistant.salary * 0.5 ? 'HIGH' : 'MEDIUM';
        
        await prisma.alert.create({
          data: {
            type: 'SALARY_DUE',
            title: `Salary Due: ${assistant.name}`,
            message: `Assistant ${assistant.name} has ${remainingSalary.toFixed(2)} remaining salary for this month. Total salary: ${assistant.salary}`,
            priority
          }
        });
        alertCount++;
      }
    }

    console.log(`✅ Salary due check completed. Created ${alertCount} alerts.`);
  } catch (error) {
    console.error('❌ Error in salary due check:', error);
  }
};

// System cleanup
const systemCleanup = async () => {
  try {
    // Clean up old alerts (older than 30 days)
    const thirtyDaysAgo = moment().subtract(30, 'days').toDate();
    
    const deletedAlerts = await prisma.alert.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        },
        isRead: true
      }
    });

    // Clean up old machine hours (older than 1 year)
    const oneYearAgo = moment().subtract(1, 'year').toDate();
    
    const deletedMachineHours = await prisma.machineHour.deleteMany({
      where: {
        date: {
          lt: oneYearAgo
        }
      }
    });

    console.log(`✅ System cleanup completed. Deleted ${deletedAlerts.count} old alerts and ${deletedMachineHours.count} old machine hours.`);
  } catch (error) {
    console.error('❌ Error in system cleanup:', error);
  }
};

// Generate monthly financial summary
const generateMonthlySummary = async () => {
  try {
    const lastMonth = moment().subtract(1, 'month');
    const startOfMonth = lastMonth.startOf('month').toDate();
    const endOfMonth = lastMonth.endOf('month').toDate();

    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      select: {
        amount: true,
        type: true
      }
    });

    const income = payments
      .filter(p => p.type === 'INCOME' || p.type === 'CONTRACT' || p.type === 'RENT')
      .reduce((sum, p) => sum + p.amount, 0);

    const expenses = payments
      .filter(p => p.type === 'EXPENSE' || p.type === 'SALARY')
      .reduce((sum, p) => sum + p.amount, 0);

    const netIncome = income - expenses;

    // Create monthly summary alert
    await prisma.alert.create({
      data: {
        type: 'GENERAL',
        title: `Monthly Financial Summary - ${lastMonth.format('MMMM YYYY')}`,
        message: `Income: ${income.toFixed(2)}, Expenses: ${expenses.toFixed(2)}, Net Income: ${netIncome.toFixed(2)}`,
        priority: 'MEDIUM'
      }
    });

    console.log(`✅ Monthly financial summary generated for ${lastMonth.format('MMMM YYYY')}.`);
  } catch (error) {
    console.error('❌ Error in monthly financial summary:', error);
  }
};