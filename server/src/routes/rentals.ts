import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireManager, AuthRequest } from '../middleware/auth';
import moment from 'moment';

const router = Router();

// LAND RENTALS

// Get all lands
router.get('/lands', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const lands = await prisma.land.findMany({
      include: {
        landRentals: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ lands });
  } catch (error) {
    console.error('Get lands error:', error);
    res.status(500).json({ error: 'Failed to get lands' });
  }
});

// Get single land
router.get('/lands/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const land = await prisma.land.findUnique({
      where: { id },
      include: {
        landRentals: {
          include: {
            land: true
          },
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    res.json({ land });
  } catch (error) {
    console.error('Get land error:', error);
    res.status(500).json({ error: 'Failed to get land' });
  }
});

// Create land
router.post('/lands', [authenticateToken, requireManager], [
  body('name').notEmpty().trim(),
  body('location').notEmpty().trim(),
  body('size').isFloat({ min: 0 }),
  body('monthlyRent').isFloat({ min: 0 }),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      location,
      size,
      monthlyRent,
      description
    } = req.body;

    const land = await prisma.land.create({
      data: {
        name,
        location,
        size,
        monthlyRent,
        description
      }
    });

    res.status(201).json({
      message: 'Land created successfully',
      land
    });
  } catch (error) {
    console.error('Create land error:', error);
    res.status(500).json({ error: 'Failed to create land' });
  }
});

// Update land
router.put('/lands/:id', [authenticateToken, requireManager], [
  body('name').optional().notEmpty().trim(),
  body('location').optional().notEmpty().trim(),
  body('size').optional().isFloat({ min: 0 }),
  body('monthlyRent').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('isAvailable').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const land = await prisma.land.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Land updated successfully',
      land
    });
  } catch (error) {
    console.error('Update land error:', error);
    res.status(500).json({ error: 'Failed to update land' });
  }
});

// Delete land
router.delete('/lands/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if land has active rentals
    const activeRentals = await prisma.landRental.findFirst({
      where: { 
        landId: id,
        status: 'ACTIVE'
      }
    });

    if (activeRentals) {
      return res.status(400).json({ 
        error: 'Cannot delete land that has active rentals' 
      });
    }

    await prisma.land.delete({
      where: { id }
    });

    res.json({ message: 'Land deleted successfully' });
  } catch (error) {
    console.error('Delete land error:', error);
    res.status(500).json({ error: 'Failed to delete land' });
  }
});

// Create land rental
router.post('/lands/:id/rent', [authenticateToken, requireManager], [
  body('tenantName').notEmpty().trim(),
  body('tenantPhone').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('monthlyRent').isFloat({ min: 0 }),
  body('advancePayments').optional().isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      tenantName,
      tenantPhone,
      startDate,
      endDate,
      monthlyRent,
      advancePayments = 0
    } = req.body;

    // Check if land exists
    const land = await prisma.land.findUnique({
      where: { id }
    });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    // Check if land is available
    if (!land.isAvailable) {
      return res.status(400).json({ error: 'Land is not available for rent' });
    }

    // Check for overlapping rentals
    const overlappingRental = await prisma.landRental.findFirst({
      where: {
        landId: id,
        status: 'ACTIVE',
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        ]
      }
    });

    if (overlappingRental) {
      return res.status(400).json({ error: 'Land is already rented for this period' });
    }

    const rental = await prisma.landRental.create({
      data: {
        landId: id,
        tenantName,
        tenantPhone,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent,
        advancePayments
      },
      include: {
        land: true
      }
    });

    // Update land availability
    await prisma.land.update({
      where: { id },
      data: { isAvailable: false }
    });

    res.status(201).json({
      message: 'Land rental created successfully',
      rental
    });
  } catch (error) {
    console.error('Create land rental error:', error);
    res.status(500).json({ error: 'Failed to create land rental' });
  }
});

// ROOM RENTALS

// Get all rooms
router.get('/rooms', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        roomRentals: {
          where: { status: 'ACTIVE' },
          orderBy: { startDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
});

// Get single room
router.get('/rooms/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomRentals: {
          include: {
            room: true
          },
          orderBy: { startDate: 'desc' }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

// Create room
router.post('/rooms', [authenticateToken, requireManager], [
  body('name').notEmpty().trim(),
  body('building').notEmpty().trim(),
  body('floor').isInt({ min: 0 }),
  body('roomNumber').notEmpty().trim(),
  body('size').isFloat({ min: 0 }),
  body('monthlyRent').isFloat({ min: 0 }),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      building,
      floor,
      roomNumber,
      size,
      monthlyRent,
      description
    } = req.body;

    const room = await prisma.room.create({
      data: {
        name,
        building,
        floor,
        roomNumber,
        size,
        monthlyRent,
        description
      }
    });

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Update room
router.put('/rooms/:id', [authenticateToken, requireManager], [
  body('name').optional().notEmpty().trim(),
  body('building').optional().notEmpty().trim(),
  body('floor').optional().isInt({ min: 0 }),
  body('roomNumber').optional().notEmpty().trim(),
  body('size').optional().isFloat({ min: 0 }),
  body('monthlyRent').optional().isFloat({ min: 0 }),
  body('description').optional().trim(),
  body('isAvailable').optional().isBoolean()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

// Delete room
router.delete('/rooms/:id', [authenticateToken, requireManager], async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if room has active rentals
    const activeRentals = await prisma.roomRental.findFirst({
      where: { 
        roomId: id,
        status: 'ACTIVE'
      }
    });

    if (activeRentals) {
      return res.status(400).json({ 
        error: 'Cannot delete room that has active rentals' 
      });
    }

    await prisma.room.delete({
      where: { id }
    });

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// Create room rental
router.post('/rooms/:id/rent', [authenticateToken, requireManager], [
  body('tenantName').notEmpty().trim(),
  body('tenantPhone').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('monthlyRent').isFloat({ min: 0 }),
  body('advancePayments').optional().isFloat({ min: 0 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      tenantName,
      tenantPhone,
      startDate,
      endDate,
      monthlyRent,
      advancePayments = 0
    } = req.body;

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room is available
    if (!room.isAvailable) {
      return res.status(400).json({ error: 'Room is not available for rent' });
    }

    // Check for overlapping rentals
    const overlappingRental = await prisma.roomRental.findFirst({
      where: {
        roomId: id,
        status: 'ACTIVE',
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) }
          }
        ]
      }
    });

    if (overlappingRental) {
      return res.status(400).json({ error: 'Room is already rented for this period' });
    }

    const rental = await prisma.roomRental.create({
      data: {
        roomId: id,
        tenantName,
        tenantPhone,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent,
        advancePayments
      },
      include: {
        room: true
      }
    });

    // Update room availability
    await prisma.room.update({
      where: { id },
      data: { isAvailable: false }
    });

    res.status(201).json({
      message: 'Room rental created successfully',
      rental
    });
  } catch (error) {
    console.error('Create room rental error:', error);
    res.status(500).json({ error: 'Failed to create room rental' });
  }
});

// Get rental financial summary
router.get('/rentals/:type/:id/financial-summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, id } = req.params;

    let rental;
    if (type === 'land') {
      rental = await prisma.landRental.findUnique({
        where: { id },
        include: {
          land: true
        }
      });
    } else if (type === 'room') {
      rental = await prisma.roomRental.findUnique({
        where: { id },
        include: {
          room: true
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid rental type' });
    }

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Calculate rental duration
    const startDate = moment(rental.startDate);
    const endDate = moment(rental.endDate);
    const duration = endDate.diff(startDate, 'months', true);

    // Calculate total rent due
    const totalRentDue = rental.monthlyRent * Math.ceil(duration);

    // Calculate remaining amount
    const remainingAmount = totalRentDue - rental.advancePayments;

    // Calculate next payment date
    const nextPaymentDate = moment(rental.startDate).add(1, 'month');

    res.json({
      rental,
      summary: {
        totalRentDue: Math.round(totalRentDue * 100) / 100,
        advancePayments: rental.advancePayments,
        remainingAmount: Math.round(remainingAmount * 100) / 100,
        duration: Math.round(duration * 100) / 100,
        nextPaymentDate: nextPaymentDate.toDate()
      }
    });
  } catch (error) {
    console.error('Get rental financial summary error:', error);
    res.status(500).json({ error: 'Failed to get rental financial summary' });
  }
});

// Record rental payment
router.post('/rentals/:type/:id/payment', [authenticateToken, requireManager], [
  body('amount').isFloat({ min: 0 }),
  body('type').isIn(['RENT']),
  body('date').isISO8601(),
  body('description').optional().trim()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, id } = req.params;
    const { amount, type: paymentType, date, description } = req.body;

    let rental;
    if (type === 'land') {
      rental = await prisma.landRental.findUnique({
        where: { id }
      });
    } else if (type === 'room') {
      rental = await prisma.roomRental.findUnique({
        where: { id }
      });
    } else {
      return res.status(400).json({ error: 'Invalid rental type' });
    }

    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        landRentalId: type === 'land' ? id : null,
        roomRentalId: type === 'room' ? id : null,
        amount,
        type: paymentType,
        date: new Date(date),
        description,
        createdById: req.user!.id
      }
    });

    // Update advance payments
    if (type === 'land') {
      await prisma.landRental.update({
        where: { id },
        data: {
          advancePayments: rental.advancePayments + amount
        }
      });
    } else {
      await prisma.roomRental.update({
        where: { id },
        data: {
          advancePayments: rental.advancePayments + amount
        }
      });
    }

    res.status(201).json({
      message: 'Rental payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Record rental payment error:', error);
    res.status(500).json({ error: 'Failed to record rental payment' });
  }
});

// Get all active rentals
router.get('/active', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const landRentals = await prisma.landRental.findMany({
      where: { status: 'ACTIVE' },
      include: {
        land: true
      },
      orderBy: { startDate: 'desc' }
    });

    const roomRentals = await prisma.roomRental.findMany({
      where: { status: 'ACTIVE' },
      include: {
        room: true
      },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      landRentals,
      roomRentals
    });
  } catch (error) {
    console.error('Get active rentals error:', error);
    res.status(500).json({ error: 'Failed to get active rentals' });
  }
});

export default router;