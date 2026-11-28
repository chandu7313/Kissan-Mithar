import { PrismaClient, Role, OrchardRequestStatus, ConsultationStatus, ConsultationMode, NotificationType, AuthAction } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = 'kissan_mithar_jwt_super_secret_key_2026_dev';
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

async function main() {
  console.log('🌱 Starting Kisan Mithar Production-Grade Database Seeding...');

  try {
    // 1. Clean existing records in reverse dependency order
    await prisma.offlineDraft.deleteMany().catch(() => {});
    await prisma.cropAdvisory.deleteMany().catch(() => {});
    await prisma.mandiPrice.deleteMany().catch(() => {});
    await prisma.emailOtp.deleteMany().catch(() => {});
    await prisma.authAuditLog.deleteMany().catch(() => {});
    await prisma.device.deleteMany().catch(() => {});
    await prisma.notification.deleteMany().catch(() => {});
    await prisma.consultation.deleteMany().catch(() => {});
    await prisma.orchardReport.deleteMany().catch(() => {});
    await prisma.orchardRequest.deleteMany().catch(() => {});
    await prisma.farmer.deleteMany().catch(() => {});
    await prisma.expert.deleteMany().catch(() => {});
    await prisma.admin.deleteMany().catch(() => {});

    console.log('🧹 Cleaned existing database tables.');

    const defaultPasswordHash = hashPassword('Kisan@123');

    // 2. Seed Admin Users
    const admin = await prisma.admin.create({
      data: {
        id: 'ADMIN-001',
        firebaseUid: 'mock_firebase_admin_main',
        name: 'Kisan Mithar Ops Admin',
        email: 'admin@gmail.com',
        passwordHash: defaultPasswordHash,
      },
    });

    console.log(`🛡️ Seeded 1 Admin: ${admin.name} (${admin.email})`);

    // 3. Seed Agronomy Experts
    const drRao = await prisma.expert.create({
      data: {
        id: 'EXPERT-001',
        firebaseUid: 'mock_firebase_dr_sunil_rao',
        name: 'Dr. Sunil Rao',
        phoneNumber: '+919811122233',
        email: 'sunil.rao@gmail.com',
        passwordHash: defaultPasswordHash,
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181172/kissan_mithar_seed_data/qwqqjf9wlcrrqwj03qqc.jpg',
        specialization: 'Horticulture & Ultra High-Density Architecture',
        experienceYears: 14,
        rating: 4.9,
        isAvailable: true,
      },
    });

    const drAnanya = await prisma.expert.create({
      data: {
        id: 'EXPERT-002',
        firebaseUid: 'mock_firebase_dr_ananya_sharma',
        name: 'Dr. Ananya Sharma',
        phoneNumber: '+919822233344',
        email: 'ananya.sharma@gmail.com',
        passwordHash: defaultPasswordHash,
        photoUrl: 'https://images.unsplash.com/photo-1594824813622-c35ba38171f1?w=400',
        specialization: 'Soil Chemistry, Drip Fertigation & Nutrition',
        experienceYears: 9,
        rating: 4.8,
        isAvailable: true,
      },
    });

    const drVikram = await prisma.expert.create({
      data: {
        id: 'EXPERT-003',
        firebaseUid: 'mock_firebase_dr_vikram_deshmukh',
        name: 'Dr. Vikram Deshmukh',
        phoneNumber: '+919833344455',
        email: 'vikram.deshmukh@gmail.com',
        passwordHash: defaultPasswordHash,
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181173/kissan_mithar_seed_data/z9y5uw3y7rcmkafveboq.jpg',
        specialization: 'Plant Pathology & Integrated Pest Management (IPM)',
        experienceYears: 12,
        rating: 4.9,
        isAvailable: true,
      },
    });

    console.log(`👨‍⚕️ Seeded 3 Agronomy Experts: ${drRao.name}, ${drAnanya.name}, ${drVikram.name}`);

    // 4. Seed Real Progressive Farmers across key horticultural zones
    const ramesh = await prisma.farmer.create({
      data: {
        id: 'FARMER-9821',
        firebaseUid: 'mock_firebase_ramesh_patel',
        phoneNumber: '+919876543210',
        name: 'Ramesh Patel',
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181174/kissan_mithar_seed_data/l0r5bm3stlv86erpopgw.jpg',
        village: 'Khed',
        district: 'Pune',
        state: 'Maharashtra',
        landAcres: 2.5,
        primaryCrop: 'Mango & Guava',
        languageCode: 'hi',
      },
    });

    const suresh = await prisma.farmer.create({
      data: {
        id: 'FARMER-4412',
        firebaseUid: 'mock_firebase_suresh_kumar',
        phoneNumber: '+919845012345',
        name: 'Suresh Kumar',
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181175/kissan_mithar_seed_data/nut8ibxtiesthof32fuy.jpg',
        village: 'Nandyal',
        district: 'Kurnool',
        state: 'Andhra Pradesh',
        landAcres: 5.0,
        primaryCrop: 'Sweet Lime & Pomegranate',
        languageCode: 'te',
      },
    });

    const venkat = await prisma.farmer.create({
      data: {
        id: 'FARMER-3390',
        firebaseUid: 'mock_firebase_venkat_rao',
        phoneNumber: '+919440155667',
        name: 'Venkat Rao',
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181176/kissan_mithar_seed_data/b422oyq2abt0dzabmtq8.jpg',
        village: 'Siddipet',
        district: 'Medak',
        state: 'Telangana',
        landAcres: 3.0,
        primaryCrop: 'Custard Apple & Dragon Fruit',
        languageCode: 'te',
      },
    });

    const balasaheb = await prisma.farmer.create({
      data: {
        id: 'FARMER-5521',
        firebaseUid: 'mock_firebase_balasaheb_shinde',
        phoneNumber: '+919860123456',
        name: 'Balasaheb Shinde',
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181176/kissan_mithar_seed_data/chiun19tcefibqbubjfm.jpg',
        village: 'Baramati',
        district: 'Pune',
        state: 'Maharashtra',
        landAcres: 4.2,
        primaryCrop: 'Grapes & Figs',
        languageCode: 'mr',
      },
    });

    const lakshmi = await prisma.farmer.create({
      data: {
        id: 'FARMER-6634',
        firebaseUid: 'mock_firebase_lakshmi_devi',
        phoneNumber: '+919490123789',
        name: 'Lakshmi Devi',
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181177/kissan_mithar_seed_data/iiiweky7ydnluenmvbpm.jpg',
        village: 'Dharmavaram',
        district: 'Anantapur',
        state: 'Andhra Pradesh',
        landAcres: 6.0,
        primaryCrop: 'Guava & Papaya',
        languageCode: 'te',
      },
    });

    const mallesh = await prisma.farmer.create({
      data: {
        id: 'FARMER-7745',
        firebaseUid: 'mock_firebase_mallesh_goud',
        phoneNumber: '+919988776655',
        name: 'Mallesh Goud',
        photoUrl: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181178/kissan_mithar_seed_data/oqesopbyaplt8wpourto.jpg',
        village: 'Jangaon',
        district: 'Warangal',
        state: 'Telangana',
        landAcres: 3.5,
        primaryCrop: 'Acid Lime & Mango',
        languageCode: 'te',
      },
    });

    console.log(`👨‍🌾 Seeded 6 Progressive Farmers across Maharashtra, AP & Telangana.`);

    // 5. Seed Realistic Orchard Requests & Feasibility Reports
    // Request 1: Ramesh Patel (PLAN_READY)
    const reqRamesh = await prisma.orchardRequest.create({
      data: {
        id: 'REQ-8921',
        farmerId: ramesh.id,
        expertId: drRao.id,
        status: OrchardRequestStatus.PLAN_READY,
        photos: {
          front: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181179/kissan_mithar_seed_data/khehjbzk4xlyzdqvbcnb.jpg',
          left: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181179/kissan_mithar_seed_data/mpufl2hlvnlxzrsr3vip.jpg',
          right: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181180/kissan_mithar_seed_data/x4swxf0kg9xjwgfpckvy.jpg',
          center: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181182/kissan_mithar_seed_data/x852hg2pwl7pvzaj3rbc.jpg',
        },
        gps: {
          latitude: 18.5204,
          longitude: 73.8567,
          accuracy: 4.8,
          village: 'Khed',
          district: 'Pune',
          state: 'Maharashtra',
        },
        landDetails: {
          size: '2.5 Acres',
          soilType: 'Red Loamy Soil (Lal Mitti)',
          waterSources: ['Borewell (2.5 Inch)', 'Canal Water Connection'],
          electricity: true,
          drip: true,
          existingCrops: ['Old Mango Trees (5 Nos)'],
        },
        notes: 'Farmer wants an ultra high-density mango and guava intercrop plantation to start generating commercial cash flow within 24 months.',
        voiceNoteUrl: 'https://actions.google.com/sounds/v1/nature/wind_through_trees.ogg',
        submittedAt: new Date(Date.now() - 4 * 86400000),
        updatedAt: new Date(Date.now() - 1 * 86400000),
      },
    });

    await prisma.orchardReport.create({
      data: {
        id: 'REP-8921',
        orchardRequestId: reqRamesh.id,
        pdfUrl: 'https://res.cloudinary.com/dazwmir34/raw/upload/v1786181185/kissan_mithar_seed_data/Sample_Orchard_Report.pdf',
        summary: 'Comprehensive 2.5-acre ultra-high density plantation plan combining Kesar Mango with Taiwan Guava intercrop for maximized early cash flow.',
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
        waterRequirement: '35 Liters / plant / day in peak summer. Drip emitters spaced at 1.5m with inline fertigation unit.',
        soilTreatment: 'Apply 15 kg well-decomposed FYM, 500g Neem cake, and 250g Trichoderma viride per planting pit (1m x 1m x 1m).',
        fertilizerSchedule: '1st Year: 100g Urea, 150g SSP, 100g MOP per plant in 3 split doses (July, Oct, Jan).',
        pestControl: 'Pre-monsoon 1% Bordeaux mixture spray for fungal blight prevention. Pheromone traps for fruit fly control.',
        estimatedBudget: 85000,
        projectedRoi: 'Break-even in Year 2 via Guava intercrop. Annual projected revenue ₹4.2 Lakhs by Year 4.',
        implementationTimeline: 'Pit digging in May, solarization in June, sapling plantation in July.',
        governmentSchemes: 'MIDH 40% drip subsidy + Maharashtra Dryland Horticulture Scheme.',
        maintenanceCalendar: 'Annual pruning in Jan; pre-flowering spray in Nov; mulching in Feb.',
        generatedAt: new Date(Date.now() - 1 * 86400000),
      },
    });

    // Request 2: Suresh Kumar (EXPERT_ASSIGNED)
    await prisma.orchardRequest.create({
      data: {
        id: 'REQ-4412',
        farmerId: suresh.id,
        expertId: drAnanya.id,
        status: OrchardRequestStatus.EXPERT_ASSIGNED,
        photos: {
          front: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181183/kissan_mithar_seed_data/ti0ypib7fwqotsbvzm2j.jpg',
          left: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181179/kissan_mithar_seed_data/mpufl2hlvnlxzrsr3vip.jpg',
        },
        gps: {
          latitude: 15.4785,
          longitude: 78.4832,
          accuracy: 5.0,
          village: 'Nandyal',
          district: 'Kurnool',
          state: 'Andhra Pradesh',
        },
        landDetails: {
          size: '5.0 Acres',
          soilType: 'Medium Black Soil (pH 7.8)',
          waterSources: ['Farm Pond (10 Lakh Liters)', 'Borewell (3 Inch)'],
          electricity: true,
          drip: false,
          existingCrops: ['Cotton'],
        },
        notes: 'Shifting from traditional cotton to high-return Bhagwa Pomegranate and Balaji Sweet Lime orchard.',
        submittedAt: new Date(Date.now() - 2 * 86400000),
        updatedAt: new Date(Date.now() - 1 * 86400000),
      },
    });

    // Request 3: Venkat Rao (COMPLETED with full report)
    const reqVenkat = await prisma.orchardRequest.create({
      data: {
        id: 'REQ-3390',
        farmerId: venkat.id,
        expertId: drRao.id,
        status: OrchardRequestStatus.COMPLETED,
        photos: {
          front: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181179/kissan_mithar_seed_data/khehjbzk4xlyzdqvbcnb.jpg',
        },
        gps: {
          latitude: 18.1018,
          longitude: 78.8522,
          accuracy: 4.2,
          village: 'Siddipet',
          district: 'Medak',
          state: 'Telangana',
        },
        landDetails: {
          size: '3.0 Acres',
          soilType: 'Gravelly Red Soil (Well Drained)',
          waterSources: ['Borewell (2.0 Inch)'],
          electricity: true,
          drip: true,
          existingCrops: ['None (Barren Land)'],
        },
        notes: 'Dryland horticulture plan required for Balanagar Custard Apple and Red Dragon Fruit trellising.',
        submittedAt: new Date(Date.now() - 6 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    await prisma.orchardReport.create({
      data: {
        id: 'REP-3390',
        orchardRequestId: reqVenkat.id,
        pdfUrl: 'https://res.cloudinary.com/dazwmir34/raw/upload/v1786181185/kissan_mithar_seed_data/Sample_Orchard_Report.pdf',
        summary: 'High-density Balanagar & NMK-1 Golden Custard Apple plantation plan optimized for low-water gravelly soil.',
        recommendedVarieties: [
          {
            crop: 'Custard Apple (Sitaphal)',
            variety: 'Balanagar & NMK-1 Golden',
            yieldPerAcre: '5.0 - 7.0 Tons',
            plantingSeason: 'July - August',
          },
        ],
        plantationLayout: {
          rowSpacingMeters: 4.0,
          plantSpacingMeters: 4.0,
          totalPlantsEstimate: 750,
        },
        waterRequirement: '15 Liters / plant / day during fruit setting. Highly drought tolerant in peak summer.',
        soilTreatment: 'Apply 10kg FYM + 250g Neem cake + 200g single super phosphate per pit.',
        fertilizerSchedule: '100g N, 50g P, 100g K per plant per year in July post-pruning.',
        pestControl: 'Mealybug barrier banding using grease on main trunk; neem oil 1500ppm foliar spray.',
        estimatedBudget: 60000,
        projectedRoi: 'Full commercial yield by Year 3. Projected net profit ₹2.2 Lakhs / year.',
        implementationTimeline: 'Pits in June, planting with first monsoon showers in July.',
        governmentSchemes: 'Telangana Rythu Bandhu & MIDH drip subsidy (70% for small farmers).',
        maintenanceCalendar: 'Annual heavy pruning in January to induce fresh fruiting branches.',
        generatedAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    // Request 4: Balasaheb Shinde (UNDER_REVIEW)
    await prisma.orchardRequest.create({
      data: {
        id: 'REQ-5521',
        farmerId: balasaheb.id,
        expertId: drRao.id,
        status: OrchardRequestStatus.UNDER_REVIEW,
        photos: {
          front: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181184/kissan_mithar_seed_data/ihtprdkzbnesiswgab0c.jpg',
          left: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181183/kissan_mithar_seed_data/ti0ypib7fwqotsbvzm2j.jpg',
        },
        gps: {
          latitude: 18.1517,
          longitude: 74.5772,
          accuracy: 3.5,
          village: 'Baramati',
          district: 'Pune',
          state: 'Maharashtra',
        },
        landDetails: {
          size: '4.2 Acres',
          soilType: 'Black Loam with Canal Silt (pH 7.2)',
          waterSources: ['Nira Left Bank Canal', 'Farm Well'],
          electricity: true,
          drip: true,
          existingCrops: ['Sugarcane (To be replaced)'],
        },
        notes: 'Replacing water-intensive sugarcane with Poona Fig (Dinkar variety) and Export Quality Table Grapes.',
        submittedAt: new Date(Date.now() - 1 * 86400000),
        updatedAt: new Date(Date.now() - 12 * 3600000),
      },
    });

    // Request 5: Lakshmi Devi (PLAN_READY)
    const reqLakshmi = await prisma.orchardRequest.create({
      data: {
        id: 'REQ-6634',
        farmerId: lakshmi.id,
        expertId: drVikram.id,
        status: OrchardRequestStatus.PLAN_READY,
        photos: {
          front: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181179/kissan_mithar_seed_data/mpufl2hlvnlxzrsr3vip.jpg',
        },
        gps: {
          latitude: 14.4137,
          longitude: 77.7126,
          accuracy: 4.0,
          village: 'Dharmavaram',
          district: 'Anantapur',
          state: 'Andhra Pradesh',
        },
        landDetails: {
          size: '6.0 Acres',
          soilType: 'Red Sandy Soil',
          waterSources: ['2 Deep Borewells (Solar Powered)'],
          electricity: true,
          drip: true,
          existingCrops: ['Groundnut'],
        },
        notes: 'Ultra High Density Taiwan Pink Guava (VNR Bihi) and Red Lady 786 Papaya intercrop.',
        submittedAt: new Date(Date.now() - 5 * 86400000),
        updatedAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    await prisma.orchardReport.create({
      data: {
        id: 'REP-6634',
        orchardRequestId: reqLakshmi.id,
        pdfUrl: 'https://res.cloudinary.com/dazwmir34/raw/upload/v1786181185/kissan_mithar_seed_data/Sample_Orchard_Report.pdf',
        summary: '6.0-acre commercial fruit orchard combining Taiwan Pink Guava (1,800 plants) with Red Lady Papaya filler crop.',
        recommendedVarieties: [
          {
            crop: 'Guava',
            variety: 'Taiwan Pink (VNR Bihi)',
            yieldPerAcre: '10.0 - 12.0 Tons',
            plantingSeason: 'June - August',
          },
          {
            crop: 'Papaya',
            variety: 'Red Lady 786',
            yieldPerAcre: '25.0 - 30.0 Tons',
            plantingSeason: 'July',
          },
        ],
        plantationLayout: {
          rowSpacingMeters: 3.0,
          plantSpacingMeters: 2.0,
          totalPlantsEstimate: 2400,
        },
        waterRequirement: '28 Liters / tree / day. Automated 4-shift solenoid drip system.',
        soilTreatment: 'Gypsum application for red soil conditioning + 20 tons FYM incorporation.',
        fertilizerSchedule: 'Water-soluble fertigation (19:19:19, 0:52:34, 13:0:45) twice a week through venturi injector.',
        pestControl: 'Bagging of guava fruitlets with foam nets for zero-residue blemish-free fruit.',
        estimatedBudget: 145000,
        projectedRoi: 'Papaya revenue starting Month 9 pays back entire project cost. Expected ₹8 Lakhs annual net profit from Year 2.',
        implementationTimeline: 'Land preparation April-May; drip installation June; planting July.',
        governmentSchemes: 'AP Horticulture Department Subsidy + Solar pump subsidy (PM-KUSUM).',
        maintenanceCalendar: 'Fruit pruning twice a year (Bahar treatment in Mrig & Hasta).',
        generatedAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    // Request 6: Mallesh Goud (SUBMITTED)
    await prisma.orchardRequest.create({
      data: {
        id: 'REQ-7745',
        farmerId: mallesh.id,
        status: OrchardRequestStatus.SUBMITTED,
        photos: {
          front: 'https://res.cloudinary.com/dazwmir34/image/upload/v1786181182/kissan_mithar_seed_data/x852hg2pwl7pvzaj3rbc.jpg',
        },
        gps: {
          latitude: 17.8532,
          longitude: 79.1583,
          accuracy: 5.5,
          village: 'Jangaon',
          district: 'Warangal',
          state: 'Telangana',
        },
        landDetails: {
          size: '3.5 Acres',
          soilType: 'Red Loam Soil',
          waterSources: ['Borewell (3.5 Inch)', 'Perennial Stream'],
          electricity: true,
          drip: false,
          existingCrops: ['Chilli & Cotton'],
        },
        notes: 'Seeking high-density Kagzi Lime (Balaji variety) and Dasheri Mango layout.',
        submittedAt: new Date(Date.now() - 6 * 3600000),
        updatedAt: new Date(Date.now() - 6 * 3600000),
      },
    });

    console.log(`📋 Seeded 6 Detailed Orchard Requests and Feasibility Reports across all lifecycle stages.`);

    // 6. Seed Consultations
    await prisma.consultation.create({
      data: {
        id: 'CNS-8921',
        farmerId: ramesh.id,
        expertId: drRao.id,
        mode: ConsultationMode.VOICE,
        category: 'Soil & Leaf Health',
        scheduledAt: new Date(Date.now() + 2 * 3600000),
        language: 'Hindi',
        status: ConsultationStatus.SCHEDULED,
        notes: 'Lower guava leaves displaying yellow chlorosis between veins. Requesting foliar micronutrient schedule.',
        mediaUrls: ['https://res.cloudinary.com/dazwmir34/image/upload/v1786181182/kissan_mithar_seed_data/x852hg2pwl7pvzaj3rbc.jpg'],
        voiceNoteUrl: 'https://actions.google.com/sounds/v1/nature/wind_through_trees.ogg',
        prescription: {
          diagnosis: 'Interveinal Chlorosis (Iron and Magnesium Deficiency in young leaves)',
          medicines: ['Chelated Iron (Fe-EDTA 12%) @ 1.5g / Liter water', 'Magnesium Sulphate @ 5g / Liter water'],
          followUpNotes: 'Spray during early morning or late afternoon. Re-evaluate leaf greenness in 10 days.',
        },
      },
    });

    await prisma.consultation.create({
      data: {
        id: 'CNS-5510',
        farmerId: suresh.id,
        expertId: drAnanya.id,
        mode: ConsultationMode.VIDEO,
        category: 'Pest & Insect Attack',
        scheduledAt: new Date(Date.now() + 26 * 3600000),
        language: 'Telugu',
        status: ConsultationStatus.SCHEDULED,
        notes: 'Fruit borer caterpillars detected in pomegranate fruitlets during early set.',
        mediaUrls: ['https://res.cloudinary.com/dazwmir34/image/upload/v1786181180/kissan_mithar_seed_data/x4swxf0kg9xjwgfpckvy.jpg'],
        prescription: {
          diagnosis: 'Anar Butterfly / Fruit Borer (Deudorix isocrates) infestation',
          medicines: ['Spinosad 45% SC @ 0.3ml / Liter water', 'Install 5 Pheromone Traps per acre'],
          followUpNotes: 'Cover developing fruitlets with butter paper / non-woven bags.',
        },
      },
    });

    await prisma.consultation.create({
      data: {
        id: 'CNS-3390',
        farmerId: venkat.id,
        expertId: drVikram.id,
        mode: ConsultationMode.VOICE,
        category: 'Fertilizer & Drip Schedule',
        scheduledAt: new Date(Date.now() - 48 * 3600000),
        language: 'Telugu',
        status: ConsultationStatus.COMPLETED,
        notes: 'Discussion on balancing N-P-K during Custard Apple flowering stage.',
        prescription: {
          diagnosis: 'Pre-flowering nutrient balance advice completed.',
          medicines: ['12:61:00 (Mono Ammonium Phosphate) @ 3kg/acre via drip', 'Boron 20% @ 1g/L spray'],
          followUpNotes: 'Satisfactory flowering initiation observed.',
        },
      },
    });

    await prisma.consultation.create({
      data: {
        id: 'CNS-6634',
        farmerId: lakshmi.id,
        expertId: drRao.id,
        mode: ConsultationMode.VIDEO,
        category: 'Canopy Management & Pruning',
        scheduledAt: new Date(Date.now() + 50 * 3600000),
        language: 'Telugu',
        status: ConsultationStatus.SCHEDULED,
        notes: 'Video demonstration on bending and tipping technique for high-density guava branches.',
      },
    });

    console.log(`👨‍⚕️ Seeded 4 Agronomy Consultations with diagnoses and prescriptions.`);

    // 7. Seed Live Notifications
    await prisma.notification.createMany({
      data: [
        {
          farmerId: ramesh.id,
          title: 'Your Orchard Plan is Ready! 🎉',
          body: 'Dr. Sunil Rao has completed your 2.5-acre High-Density layout plan. Tap to view.',
          type: NotificationType.SUCCESS,
          deepLink: '/orchard/report',
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 86400000),
        },
        {
          farmerId: ramesh.id,
          title: 'Heavy Rain Tomorrow — Delay Spraying 🌧️',
          body: 'Precipitation exceeding 18mm expected in Khed, Pune. Delay foliar fertilizer application.',
          type: NotificationType.ALERT,
          deepLink: '/weather',
          isRead: false,
          createdAt: new Date(Date.now() - 12 * 3600000),
        },
        {
          farmerId: ramesh.id,
          title: 'Upcoming Expert Voice Consultation 📞',
          body: 'Scheduled voice consultation with Dr. Sunil Rao today at 2:30 PM.',
          type: NotificationType.CONSULTATION,
          deepLink: '/consultation/history',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 3600000),
        },
        {
          farmerId: suresh.id,
          title: 'Pomegranate Mandi Rate Surged 📈',
          body: 'Bhagwa Pomegranate prices up +₹800/Q in Kurnool APMC today.',
          type: NotificationType.MARKET,
          deepLink: '/market-prices',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 3600000),
        },
        {
          farmerId: venkat.id,
          title: 'Orchard Plan Finalized ✅',
          body: 'Your Custard Apple layout is approved. Tap to download your agronomy PDF report.',
          type: NotificationType.SUCCESS,
          deepLink: '/orchard/report',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
        {
          farmerId: lakshmi.id,
          title: 'Orchard Feasibility Report Ready 🌿',
          body: 'Taiwan Guava + Papaya intercrop layout ready for your 6-acre land in Dharmavaram.',
          type: NotificationType.SUCCESS,
          deepLink: '/orchard/report',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
      ],
    });

    // 8. Seed Mandi Prices (Live Market Rates)
    await prisma.mandiPrice.createMany({
      data: [
        {
          commodity: 'Mango',
          variety: 'Kesar',
          market: 'Pune APMC (Gultekdi)',
          district: 'Pune',
          state: 'Maharashtra',
          minPrice: 7200,
          maxPrice: 9500,
          modalPrice: 8500,
          trend: 'UP',
        },
        {
          commodity: 'Guava',
          variety: 'Taiwan Pink (VNR)',
          market: 'Pune APMC',
          district: 'Pune',
          state: 'Maharashtra',
          minPrice: 3200,
          maxPrice: 4400,
          modalPrice: 3800,
          trend: 'STABLE',
        },
        {
          commodity: 'Pomegranate',
          variety: 'Bhagwa',
          market: 'Solapur APMC',
          district: 'Solapur',
          state: 'Maharashtra',
          minPrice: 8000,
          maxPrice: 11000,
          modalPrice: 9500,
          trend: 'UP',
        },
        {
          commodity: 'Sweet Lime (Mosambi)',
          variety: 'Balaji',
          market: 'Kurnool APMC',
          district: 'Kurnool',
          state: 'Andhra Pradesh',
          minPrice: 3600,
          maxPrice: 4800,
          modalPrice: 4200,
          trend: 'UP',
        },
        {
          commodity: 'Custard Apple',
          variety: 'Balanagar Special',
          market: 'Gaddiannaram Fruit Market',
          district: 'Hyderabad',
          state: 'Telangana',
          minPrice: 5500,
          maxPrice: 7500,
          modalPrice: 6500,
          trend: 'UP',
        },
        {
          commodity: 'Acid Lime (Nimbu)',
          variety: 'Kagzi Lime',
          market: 'Warangal Mandi',
          district: 'Warangal',
          state: 'Telangana',
          minPrice: 4800,
          maxPrice: 6200,
          modalPrice: 5500,
          trend: 'STABLE',
        },
        {
          commodity: 'Papaya',
          variety: 'Red Lady 786',
          market: 'Anantapur APMC',
          district: 'Anantapur',
          state: 'Andhra Pradesh',
          minPrice: 1800,
          maxPrice: 2500,
          modalPrice: 2200,
          trend: 'STABLE',
        },
      ],
    });

    console.log(`📊 Seeded 7 Real Mandi Market Price records for key crops.`);

    // 9. Seed Expert Crop Cultivation Advisories
    await prisma.cropAdvisory.createMany({
      data: [
        {
          expertId: drRao.id,
          crop: 'Guava',
          title: 'High-Density Guava Canopy Training & Shoot Bending Guide',
          description: 'To stimulate dormant lateral buds into fruitful flowering shoots, perform shoot bending 45 days after monsoon pruning. Keep 4 main scaffolds at 45-degree angles.',
          alertLevel: 'NORMAL',
          season: 'ALL_SEASON',
        },
        {
          expertId: drAnanya.id,
          crop: 'Mango',
          title: 'Monsoon Soil Health & Micronutrient Drenching Protocol',
          description: 'Pre-monsoon application of 250g Trichoderma viride enriched in 10kg Farmyard Manure prevents Phytophthora root rot in water-retentive black soils.',
          alertLevel: 'WARNING',
          season: 'KHARIF',
        },
        {
          expertId: drVikram.id,
          crop: 'Pomegranate',
          title: 'Bacterial Blight (Telya) Prevention & Bordeaux Spray Schedule',
          description: 'Spray 1% freshly prepared Bordeaux mixture or Copper Hydroxide (2.5g/L) immediately after rain breaks to prevent Xanthomonas bacterial blight.',
          alertLevel: 'CRITICAL',
          season: 'KHARIF',
        },
      ],
    });

    // 10. Seed Authentication Audit Logs
    await prisma.authAuditLog.createMany({
      data: [
        {
          userId: drRao.id,
          userType: Role.EXPERT,
          userName: drRao.name,
          userEmail: drRao.email,
          action: AuthAction.LOGIN,
          ipAddress: '127.0.0.1 (Web Console)',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0',
          timestamp: new Date(Date.now() - 3600000 * 2),
        },
        {
          userId: drRao.id,
          userType: Role.EXPERT,
          userName: drRao.name,
          userEmail: drRao.email,
          action: AuthAction.LOGOUT,
          ipAddress: '127.0.0.1 (Web Console)',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0',
          timestamp: new Date(Date.now() - 3600000 * 5),
        },
        {
          userId: admin.id,
          userType: Role.ADMIN,
          userName: admin.name,
          userEmail: admin.email,
          action: AuthAction.LOGIN,
          ipAddress: '127.0.0.1 (Admin Console)',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0',
          timestamp: new Date(Date.now() - 3600000 * 8),
        },
      ],
    });

    // 11. Seed Active Test Email OTPs
    await prisma.emailOtp.createMany({
      data: [
        {
          email: 'sunil.rao@gmail.com',
          otp: '731300',
          purpose: 'LOGIN',
          expiresAt: new Date(Date.now() + 24 * 3600000), // 24hr valid for testing
          isUsed: false,
        },
        {
          email: 'admin@gmail.com',
          otp: '731300',
          purpose: 'LOGIN',
          expiresAt: new Date(Date.now() + 24 * 3600000),
          isUsed: false,
        },
        {
          email: 'ananya.sharma@gmail.com',
          otp: '731300',
          purpose: 'LOGIN',
          expiresAt: new Date(Date.now() + 24 * 3600000),
          isUsed: false,
        },
      ],
    });

    // 12. Seed Device FCM Tokens
    await prisma.device.create({
      data: {
        farmerId: ramesh.id,
        fcmToken: 'mock_fcm_token_ramesh_android_2026',
        platform: 'android',
      },
    });

    console.log('================================================================');
    console.log('✅ PRODUCTION SEED COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
    console.log('🔑 Dev Login Credentials:');
    console.log('   - Admin:  admin@gmail.com        | Password: Kisan@123 | OTP: 731300');
    console.log('   - Expert: sunil.rao@gmail.com    | Password: Kisan@123 | OTP: 731300');
    console.log('   - Expert: ananya.sharma@gmail.com | Password: Kisan@123 | OTP: 731300');
    console.log('================================================================\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
