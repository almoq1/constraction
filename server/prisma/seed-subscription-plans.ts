import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log('🌱 Seeding subscription plans...');

  const plans = [
    {
      name: 'FREE',
      slug: 'free',
      description: 'Perfect for small construction companies getting started',
      price: 0,
      billingCycle: 'MONTHLY',
      maxUsers: 5,
      maxMachines: 10,
      maxDrivers: 5,
      maxContracts: 10,
      features: [
        'Basic machine management',
        'Driver and assistant accounts',
        'Simple contract tracking',
        'Basic reporting',
        'Email support',
        '30-day trial'
      ],
      isActive: true
    },
    {
      name: 'BASIC',
      slug: 'basic',
      description: 'Ideal for growing construction companies',
      price: 99,
      billingCycle: 'MONTHLY',
      maxUsers: 10,
      maxMachines: 25,
      maxDrivers: 10,
      maxContracts: 25,
      features: [
        'Everything in FREE',
        'Custom landing page',
        'Advanced reporting',
        'Email and phone support',
        'Priority customer service',
        'Data backup'
      ],
      isActive: true
    },
    {
      name: 'PROFESSIONAL',
      slug: 'professional',
      description: 'For established construction companies',
      price: 299,
      billingCycle: 'MONTHLY',
      maxUsers: 25,
      maxMachines: 50,
      maxDrivers: 25,
      maxContracts: 50,
      features: [
        'Everything in BASIC',
        'Custom domain',
        'Advanced analytics',
        'Priority support',
        'API access',
        'White-label options',
        'Dedicated account manager'
      ],
      isActive: true
    },
    {
      name: 'ENTERPRISE',
      slug: 'enterprise',
      description: 'For large construction enterprises',
      price: 599,
      billingCycle: 'MONTHLY',
      maxUsers: 100,
      maxMachines: 200,
      maxDrivers: 100,
      maxContracts: 200,
      features: [
        'Everything in PROFESSIONAL',
        '24/7 support',
        'Dedicated server',
        'Custom integrations',
        'On-premise deployment',
        'SLA guarantee',
        'Custom training'
      ],
      isActive: true
    }
  ];

  for (const plan of plans) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug: plan.slug }
    });

    if (!existingPlan) {
      await prisma.subscriptionPlan.create({
        data: {
          name: plan.name,
          slug: plan.slug,
          description: plan.description,
          price: plan.price,
          billingCycle: plan.billingCycle,
          maxUsers: plan.maxUsers,
          maxMachines: plan.maxMachines,
          maxDrivers: plan.maxDrivers,
          maxContracts: plan.maxContracts,
          features: plan.features,
          isActive: plan.isActive
        }
      });
      console.log(`✅ Created subscription plan: ${plan.name}`);
    } else {
      console.log(`⏭️  Subscription plan already exists: ${plan.name}`);
    }
  }

  console.log('✅ Subscription plans seeding completed!');
}

async function main() {
  try {
    await seedSubscriptionPlans();
  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedSubscriptionPlans };