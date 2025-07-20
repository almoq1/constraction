import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// Get dashboard overview
router.get('/overview', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const today = new Date();
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Get counts
    const [
      totalMachines,
      availableMachines,
      totalDrivers,
      activeDrivers,
      totalAssistants,
      activeAssistants,
      totalContracts,
      activeContracts,
      totalLands,
      availableLands,
      totalRooms,
      availableRooms,
      unreadAlerts
    ] = await Promise.all([
      prisma.machine.count(),
      prisma.machine.count({ where: { isAvailable: true } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { isActive: true } }),
      prisma.driverAssistant.count(),
      prisma.driverAssistant.count({ where: { isActive: true } }),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.land.count(),
      prisma.land.count({ where: { isAvailable: true } }),
      prisma.room.count(),
      prisma.room.count({ where: { isAvailable: true } }),
      prisma.alert.count({ where: { isRead: false } })
    ]);

    // Get financial data for current month
    const monthlyPayments = await prisma.payment.findMany({
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

    const monthlyIncome = monthlyPayments
      .filter(p => p.type === 'INCOME' || p.type === 'CONTRACT' || p.type === 'RENT')
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyExpenses = monthlyPayments
      .filter(p => p.type === 'EXPENSE' || p.type === 'SALARY')
      .reduce((sum, p) => sum + p.amount, 0);

    const netIncome = monthlyIncome - monthlyExpenses;

    // Get recent activities
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        contract: {
          select: { title: true, clientName: true }
        },
        landRental: {
          select: { tenantName: true, land: { select: { name: true } } }
        },
        roomRental: {
          select: { tenantName: true, room: { select: { name: true } } }
        }
      }
    });

    const recentContracts = await prisma.contract.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        clientName: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    });

    // Get upcoming due dates
    const upcomingRentals = await prisma.landRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: moment().add(7, 'days').toDate()
        }
      },
      include: {
        land: { select: { name: true } }
      },
      take: 5
    });

    const upcomingRoomRentals = await prisma.roomRental.findMany({
      where: {
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: moment().add(7, 'days').toDate()
        }
      },
      include: {
        room: { select: { name: true } }
      },
      take: 5
    });

    res.json({
      overview: {
        machines: {
          total: totalMachines,
          available: availableMachines,
          utilization: totalMachines > 0 ? ((totalMachines - availableMachines) / totalMachines * 100).toFixed(1) : '0'
        },
        personnel: {
          drivers: { total: totalDrivers, active: activeDrivers },
          assistants: { total: totalAssistants, active: activeAssistants }
        },
        contracts: {
          total: totalContracts,
          active: activeContracts
        },
        rentals: {
          lands: { total: totalLands, available: availableLands },
          rooms: { total: totalRooms, available: availableRooms }
        },
        alerts: {
          unread: unreadAlerts
        }
      },
      financial: {
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        netIncome: Math.round(netIncome * 100) / 100,
        period: { start: startOfMonth, end: endOfMonth }
      },
      recent: {
        payments: recentPayments,
        contracts: recentContracts
      },
      upcoming: {
        rentals: [...upcomingRentals, ...upcomingRoomRentals]
          .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
          .slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to get dashboard overview' });
  }
});

// Get machine utilization
router.get('/machine-utilization', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const machines = await prisma.machine.findMany({
      include: {
        machineAssignments: {
          where: { isActive: true }
        },
        contractMachines: {
          include: {
            contract: true
          }
        },
        machineHours: {
          where: {
            date: {
              gte: moment().startOf('month').toDate()
            }
          }
        }
      }
    });

    const utilization = machines.map(machine => {
      const totalHours = machine.machineHours.reduce((sum, hour) => sum + hour.hoursWorked, 0);
      const requiredHours = machine.machineHours.reduce((sum, hour) => sum + hour.requiredHours, 0);
      const efficiency = requiredHours > 0 ? (totalHours / requiredHours) * 100 : 0;
      const isAssigned = machine.machineAssignments.length > 0;
      const activeContracts = machine.contractMachines.filter(cm => cm.contract.status === 'ACTIVE').length;

      return {
        id: machine.id,
        name: machine.name,
        type: machine.type,
        isAvailable: machine.isAvailable,
        isAssigned,
        activeContracts,
        totalHours: Math.round(totalHours * 100) / 100,
        requiredHours: Math.round(requiredHours * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        dailyRate: machine.dailyRate,
        hourlyRate: machine.hourlyRate
      };
    });

    res.json({ utilization });
  } catch (error) {
    console.error('Get machine utilization error:', error);
    res.status(500).json({ error: 'Failed to get machine utilization' });
  }
});

// Get financial trends
router.get('/financial-trends', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { period = '6' } = req.query;
    const months = parseInt(period as string);

    const trends = [];
    const startDate = moment().subtract(months, 'months').startOf('month');

    for (let i = 0; i < months; i++) {
      const monthStart = moment(startDate).add(i, 'months').startOf('month');
      const monthEnd = moment(monthStart).endOf('month');

      const payments = await prisma.payment.findMany({
        where: {
          date: {
            gte: monthStart.toDate(),
            lte: monthEnd.toDate()
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

      trends.push({
        month: monthStart.format('YYYY-MM'),
        monthName: monthStart.format('MMMM YYYY'),
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        netIncome: Math.round((income - expenses) * 100) / 100
      });
    }

    res.json({ trends });
  } catch (error) {
    console.error('Get financial trends error:', error);
    res.status(500).json({ error: 'Failed to get financial trends' });
  }
});

// Get contract performance
router.get('/contract-performance', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const contracts = await prisma.contract.findMany({
      where: { status: 'ACTIVE' },
      include: {
        contractMachines: {
          include: {
            machine: {
              include: {
                machineHours: {
                  where: {
                    date: {
                      gte: moment().startOf('month').toDate()
                    }
                  }
                }
              }
            }
          }
        },
        payments: {
          orderBy: { date: 'asc' }
        }
      }
    });

    const performance = contracts.map(contract => {
      const totalAmount = contract.totalAmount;
      const totalReceived = contract.payments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentPercentage = totalAmount > 0 ? (totalReceived / totalAmount) * 100 : 0;

      const totalMachineHours = contract.contractMachines.reduce((sum, cm) => {
        return sum + cm.machine.machineHours.reduce((hourSum, hour) => hourSum + hour.hoursWorked, 0);
      }, 0);

      const totalRequiredHours = contract.contractMachines.reduce((sum, cm) => {
        return sum + cm.machine.machineHours.reduce((hourSum, hour) => hourSum + hour.requiredHours, 0);
      }, 0);

      const efficiency = totalRequiredHours > 0 ? (totalMachineHours / totalRequiredHours) * 100 : 0;

      const daysRemaining = moment(contract.endDate).diff(moment(), 'days');

      return {
        id: contract.id,
        title: contract.title,
        clientName: contract.clientName,
        totalAmount,
        totalReceived: Math.round(totalReceived * 100) / 100,
        remainingAmount: Math.round((totalAmount - totalReceived) * 100) / 100,
        paymentPercentage: Math.round(paymentPercentage * 100) / 100,
        totalMachineHours: Math.round(totalMachineHours * 100) / 100,
        totalRequiredHours: Math.round(totalRequiredHours * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        daysRemaining,
        machineCount: contract.contractMachines.length,
        startDate: contract.startDate,
        endDate: contract.endDate
      };
    });

    res.json({ performance });
  } catch (error) {
    console.error('Get contract performance error:', error);
    res.status(500).json({ error: 'Failed to get contract performance' });
  }
});

// Get personnel summary
router.get('/personnel-summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        driverAssignments: {
          where: { isActive: true },
          include: {
            machine: true
          }
        },
        salaryPayments: {
          where: {
            date: {
              gte: moment().startOf('month').toDate()
            }
          }
        }
      }
    });

    const assistants = await prisma.driverAssistant.findMany({
      include: {
        assistantAssignments: {
          where: { isActive: true },
          include: {
            machine: true
          }
        },
        salaryPayments: {
          where: {
            date: {
              gte: moment().startOf('month').toDate()
            }
          }
        }
      }
    });

    const driverSummary = drivers.map(driver => {
      const totalPaid = driver.salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingSalary = driver.salary - totalPaid;
      const assignedMachine = driver.driverAssignments[0]?.machine;

      return {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        isActive: driver.isActive,
        isOnVacation: driver.isOnVacation,
        salary: driver.salary,
        totalPaid: Math.round(totalPaid * 100) / 100,
        remainingSalary: Math.round(remainingSalary * 100) / 100,
        assignedMachine: assignedMachine ? {
          id: assignedMachine.id,
          name: assignedMachine.name,
          type: assignedMachine.type
        } : null,
        experience: driver.experience
      };
    });

    const assistantSummary = assistants.map(assistant => {
      const totalPaid = assistant.salaryPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingSalary = assistant.salary - totalPaid;
      const assignedMachine = assistant.assistantAssignments[0]?.machine;

      return {
        id: assistant.id,
        name: assistant.name,
        phone: assistant.phone,
        isActive: assistant.isActive,
        isOnVacation: assistant.isOnVacation,
        salary: assistant.salary,
        totalPaid: Math.round(totalPaid * 100) / 100,
        remainingSalary: Math.round(remainingSalary * 100) / 100,
        assignedMachine: assignedMachine ? {
          id: assignedMachine.id,
          name: assignedMachine.name,
          type: assignedMachine.type
        } : null,
        experience: assistant.experience
      };
    });

    res.json({
      drivers: driverSummary,
      assistants: assistantSummary
    });
  } catch (error) {
    console.error('Get personnel summary error:', error);
    res.status(500).json({ error: 'Failed to get personnel summary' });
  }
});

export default router;