import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Kisan Mithar Database Seed...');

  try {
    // 1. Clean existing records
    await prisma.notification.deleteMany();
    await prisma.device.deleteMany();
    await prisma.consultation.deleteMany();
    await prisma.orchardReport.deleteMany();
    await prisma.orchardRequest.deleteMany();
    await prisma.farmer.deleteMany();
    await prisma.expert.deleteMany();
    await prisma.admin.deleteMany();

    console.log('🧹 Cleaned existing tables.');

    // 2. Seed Farmers
    const ramesh = await prisma.farmer.create({
      data: {
        id: 'FARMER-9821',
        firebaseUid: 'mock_firebase_ramesh_patel',
        phoneNumber: '+919876543210',
        name: 'Ramesh Patel',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        village: 'Khed',
        district: 'Pune',
        state: 'Maharashtra',
        landAcres: 2.5,
        primaryCrop: 'Mango & Guava',
        languageCode: 'en',
      },
    });

    const suresh = await prisma.farmer.create({
      data: {
        id: 'FARMER-4412',
        firebaseUid: 'mock_firebase_suresh_kumar',
        phoneNumber: '+919845012345',
        name: 'Suresh Kumar',
        photoUrl: null,
        village: 'Nandyal',
        district: 'Kurnool',
        state: 'Andhra Pradesh',
        landAcres: 5.0,
        primaryCrop: 'Cotton & Sweet Lime',
        languageCode: 'te',
      },
    });

    console.log(`👨‍🌾 Seeded 2 Farmers: ${ramesh.name}, ${suresh.name}`);

    // 3. Seed Experts
    const drRao = await prisma.expert.create({
      data: {
        id: 'EXPERT-001',
        firebaseUid: 'mock_firebase_dr_sunil_rao',
        name: 'Dr. Sunil Rao',
        phoneNumber: '+919811122233',
        email: 'sunil.rao@kissanmithar.in',
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
        specialization: 'Horticulture & Orchard Architecture',
        experienceYears: 14,
        rating: 4.9,
        isAvailable: true,
      },
    });

    const drAnanya = await prisma.expert.create({
      data: {
        id: 'EXPERT-002',
        name: 'Dr. Ananya Sharma',
        phoneNumber: '+919822233344',
        email: 'ananya.sharma@kissanmithar.in',
        photoUrl: 'https://images.unsplash.com/photo-1594824813622-c35ba38171f1?w=400',
        specialization: 'Soil Chemistry & Micro-Irrigation',
        experienceYears: 9,
        rating: 4.8,
        isAvailable: true,
      },
    });

    console.log(`👨‍⚕️ Seeded 2 Agronomy Experts: ${drRao.name}, ${drAnanya.name}`);

    // 4. Seed Admin
    const admin = await prisma.admin.create({
      data: {
        id: 'ADMIN-001',
        firebaseUid: 'mock_firebase_admin_main',
        name: 'Kisan Mithar Ops Admin',
        email: 'admin@kissanmithar.in',
      },
    });

    console.log(`🛡️ Seeded 1 Admin: ${admin.name}`);

    // 5. Seed Orchard Request & Report for Ramesh
    const orchardReq = await prisma.orchardRequest.create({
      data: {
        id: 'REQ-8921',
        farmerId: ramesh.id,
        expertId: drRao.id,
        status: 'PLAN_READY',
        photos: {
          front: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
          left: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
          right: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
          center: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800',
        },
        gps: {
          latitude: 18.5204,
          longitude: 73.8567,
          accuracy: 5.2,
          village: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
        },
        landDetails: {
          size: '2.5 Acres',
          soilType: 'Red Soil (Lal Mitti)',
          waterSources: ['Borewell', 'Drip'],
          electricity: true,
          drip: true,
          existingCrops: ['Mango'],
        },
        notes: 'Looking to plant ultra-high density mango & guava intercrop with drip fertigation.',
      },
    });

    await prisma.orchardReport.create({
      data: {
        id: 'REP-8921',
        orchardRequestId: orchardReq.id,
        pdfUrl: 'https://api.kissanmithar.in/reports/KM-Orchard-Plan-8921.pdf',
        summary:
          'Comprehensive 2.5-acre ultra-high density plantation plan combining Kesar Mango with Taiwan Guava intercrop for maximized early cash flow.',
        recommendedVarieties: [
          {
            crop: 'Mango',
            variety: 'Kesar & Alphonso',
            yieldPerAcre: '4.5 - 6.0 Tons',
            plantingSeason: 'July - August (Monsoon)',
          },
          {
            crop: 'Guava',
            variety: 'Taiwan Pink (VNR Bihi)',
            yieldPerAcre: '8.0 - 10.0 Tons',
            plantingSeason: 'July - September',
          },
        ],
        plantationLayout: {
          rowSpacingMeters: 4.5,
          plantSpacingMeters: 3.0,
          totalPlantsEstimate: 740,
        },
        waterRequirement:
          '35 Liters / plant / day in peak summer. Drip emitters spaced at 1.5m with inline fertigation unit.',
        soilTreatment:
          'Apply 15 kg well-decomposed FYM, 500g Neem cake, and 250g Trichoderma viride per planting pit (1m x 1m x 1m).',
        pestControl:
          'Pre-monsoon 1% Bordeaux mixture spray for fungal blight prevention. Pheromone traps for fruit fly control.',
        estimatedBudget: 85000,
      },
    });

    console.log(`📋 Seeded Orchard Request ${orchardReq.id} with completed OrchardReport`);

    // 6. Seed Consultations
    await prisma.consultation.create({
      data: {
        id: 'CNS-8921',
        farmerId: ramesh.id,
        expertId: drRao.id,
        mode: 'VOICE',
        category: 'Soil & Leaf Health',
        scheduledAt: new Date(Date.now() + 24 * 3600 * 1000),
        language: 'Hindi',
        status: 'SCHEDULED',
        notes: 'Lower guava leaves displaying yellow chlorosis between veins.',
      },
    });

    // 7. Seed Notifications
    await prisma.notification.createMany({
      data: [
        {
          farmerId: ramesh.id,
          title: 'Your Orchard Plan is Ready! 🎉',
          body: 'Dr. Sunil Rao has completed your 2.5-acre High-Density layout plan. Tap to view.',
          type: 'SUCCESS',
          deepLink: '/orchard/report',
          isRead: false,
        },
        {
          farmerId: ramesh.id,
          title: 'Heavy Rain Tomorrow — Delay Spraying 🌧️',
          body: 'Precipitation exceeding 15mm expected in Khed, Pune. Delay foliar fertilizer application.',
          type: 'ALERT',
          deepLink: '/weather',
          isRead: false,
        },
        {
          farmerId: ramesh.id,
          title: 'Upcoming Expert Consultation 📞',
          body: 'Scheduled voice consultation with Dr. Sunil Rao on tomorrow at 10:30 AM.',
          type: 'CONSULTATION',
          deepLink: '/consultation/history',
          isRead: true,
        },
      ],
    });

    // 8. Seed Device FCM Token
    await prisma.device.create({
      data: {
        farmerId: ramesh.id,
        fcmToken: 'mock_fcm_token_ramesh_device_android_2026',
        platform: 'android',
      },
    });

    console.log('✅ Seed completed successfully with all relations!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
