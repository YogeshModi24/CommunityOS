import { RepositoryFactory } from '@community-os/repositories';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { env } from './env';

const MONGODB_URI = env.MONGODB_URI;

const userRepository = RepositoryFactory.createUserRepository({ engine: 'mongo' });
const issueRepository = RepositoryFactory.createIssueRepository({ engine: 'mongo' });

async function seed(): Promise<void> {
  await mongoose.connect(MONGODB_URI!);
  console.error('[Seed] Connected to MongoDB');

  // Clear existing data
  await userRepository.deleteAll();
  await issueRepository.deleteAll();
  console.error('[Seed] Cleared existing data');

  // Create users — bcrypt cost factor 10 (fast, standard for dev)
  const rahulPassword = await bcrypt.hash('demo123', 10);
  const priyaPassword = await bcrypt.hash('demo123', 10);

  const rahul = await userRepository.create({
    name: 'Rahul Sharma',
    email: 'rahul@demo.com',
    password: rahulPassword,
    role: 'citizen',
    ward: 'Ward 12',
    points: 142,
    issues_reported: 9,
  });

  const priya = await userRepository.create({
    name: 'Priya Patel',
    email: 'priya@demo.com',
    password: priyaPassword,
    role: 'citizen',
    ward: 'Ward 7',
    points: 89,
    issues_reported: 6,
  });

  console.error(`[Seed] Created users: ${rahul.name}, ${priya.name}`);

  const issues = [
    {
      title: 'Water main burst on Sadul Colony',
      description: 'Major water leak flooding road and nearby homes',
      category: 'water_leak' as const,
      severity: 5,
      status: 'open' as const,
      ai_category: 'water_leak',
      ai_confidence: 0.96,
      ai_description: 'Water main burst causing road flooding and property damage',
      hazardous: true,
      votes: 38,
      address: 'Sadul Colony, Bikaner',
      ward: 'Ward 5',
      mediaUrl: 'https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=600',
      mediaPublicId: 'seed_1',
      lat: 28.0241,
      lng: 73.3089,
      reporterId: priya.id,
      status_history: [{ status: 'open', note: 'Issue reported', timestamp: new Date() }],
    },
    {
      title: 'Road surface crumbling near Rani Bazar',
      description: 'Entire road surface breaking up after monsoon',
      category: 'pothole' as const,
      severity: 4,
      status: 'in_progress' as const,
      ai_category: 'pothole',
      ai_confidence: 0.94,
      ai_description: 'Large pothole causing vehicle damage and traffic disruption',
      hazardous: true,
      votes: 41,
      address: 'Rani Bazar, Bikaner',
      ward: 'Ward 12',
      mediaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      mediaPublicId: 'seed_2',
      lat: 28.0198,
      lng: 73.3178,
      reporterId: rahul.id,
      status_history: [
        { status: 'open', note: 'Issue reported', timestamp: new Date(Date.now() - 86400000 * 5) },
        {
          status: 'verified',
          note: 'Confirmed severe damage',
          timestamp: new Date(Date.now() - 86400000 * 3),
        },
        { status: 'in_progress', note: 'Repair crew assigned', timestamp: new Date() },
      ],
    },
    {
      title: 'Open sewage drain near Govt. School',
      description: 'Uncovered sewage drain, severe health risk to children',
      category: 'sewage' as const,
      severity: 5,
      status: 'resolved' as const,
      ai_category: 'sewage',
      ai_confidence: 0.91,
      ai_description: 'Open sewage drain posing serious health hazard near school',
      hazardous: true,
      votes: 52,
      address: 'Near Govt. School, Shastri Nagar, Bikaner',
      ward: 'Ward 6',
      mediaUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
      mediaPublicId: 'seed_3',
      lat: 28.0267,
      lng: 73.3056,
      reporterId: priya.id,
      status_history: [
        { status: 'open', note: 'Issue reported', timestamp: new Date(Date.now() - 86400000 * 10) },
        {
          status: 'verified',
          note: 'Confirmed hazardous',
          timestamp: new Date(Date.now() - 86400000 * 8),
        },
        {
          status: 'in_progress',
          note: 'Crew assigned for repair',
          timestamp: new Date(Date.now() - 86400000 * 5),
        },
        { status: 'resolved', note: 'Drain covered and disinfected', timestamp: new Date() },
      ],
    },
    {
      title: 'Broken streetlight causing accidents',
      description: 'Streetlight is non-functional, leaving the street completely dark at night',
      category: 'streetlight' as const,
      severity: 3,
      status: 'open' as const,
      ai_category: 'streetlight',
      ai_confidence: 0.88,
      ai_description: 'Broken streetlight leaving road section completely dark',
      hazardous: false,
      votes: 19,
      address: 'Padam Singh Road, Bikaner',
      ward: 'Ward 8',
      mediaUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600',
      mediaPublicId: 'seed_4',
      lat: 28.0215,
      lng: 73.3145,
      reporterId: priya.id,
      status_history: [{ status: 'open', note: 'Issue reported', timestamp: new Date() }],
    },
    {
      title: 'Garbage pile blocking footpath',
      description: 'Large pile of construction waste blocking half the road',
      category: 'garbage' as const,
      severity: 2,
      status: 'open' as const,
      ai_category: 'garbage',
      ai_confidence: 0.92,
      ai_description: 'Uncollected garbage blocking pedestrian footpath',
      hazardous: false,
      votes: 14,
      address: 'Station Road, Bikaner',
      ward: 'Ward 3',
      mediaUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600',
      mediaPublicId: 'seed_5',
      lat: 28.0185,
      lng: 73.3201,
      reporterId: rahul.id,
      status_history: [{ status: 'open', note: 'Issue reported', timestamp: new Date() }],
    },
    {
      title: 'Deep pothole on main arterial road',
      description: 'Deep pothole causing vehicle damage and traffic congestion',
      category: 'pothole' as const,
      severity: 4,
      status: 'open' as const,
      ai_category: 'pothole',
      ai_confidence: 0.97,
      ai_description: 'Deep pothole on main road causing vehicle damage',
      hazardous: true,
      votes: 33,
      address: 'Jai Narain Vyas Colony, Bikaner',
      ward: 'Ward 9',
      mediaUrl: 'https://images.unsplash.com/photo-1573496799515-eebbb63814f2?w=600',
      mediaPublicId: 'seed_6',
      lat: 28.0256,
      lng: 73.3098,
      reporterId: rahul.id,
      status_history: [{ status: 'open', note: 'Issue reported', timestamp: new Date() }],
    },
    {
      title: 'Road waterlogging after rain',
      description: 'Entire stretch of road flooded after monsoons',
      category: 'water_leak' as const,
      severity: 3,
      status: 'verified' as const,
      ai_category: 'water_leak',
      ai_confidence: 0.89,
      ai_description: 'Severe waterlogging blocking road access after rainfall',
      hazardous: false,
      votes: 22,
      address: 'Lalgarh Palace Road, Bikaner',
      ward: 'Ward 11',
      mediaUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600',
      mediaPublicId: 'seed_7',
      lat: 28.0232,
      lng: 73.3167,
      reporterId: priya.id,
      status_history: [
        { status: 'open', note: 'Issue reported', timestamp: new Date(Date.now() - 86400000 * 3) },
        { status: 'verified', note: 'PHED team dispatched', timestamp: new Date() },
      ],
    },
    {
      title: 'Pothole causing two-wheeler accidents',
      description: 'Deep potholes on high-speed road causing accidents',
      category: 'pothole' as const,
      severity: 5,
      status: 'open' as const,
      ai_category: 'pothole',
      ai_confidence: 0.98,
      ai_description: 'Dangerous pothole causing motorcycle accidents on busy road',
      hazardous: true,
      votes: 67,
      address: 'Karni Singh Stadium Road, Bikaner',
      ward: 'Ward 14',
      mediaUrl: 'https://images.unsplash.com/photo-1596394723269-b2cbca4c4a07?w=600',
      mediaPublicId: 'seed_8',
      lat: 28.0209,
      lng: 73.3123,
      reporterId: rahul.id,
      status_history: [{ status: 'open', note: 'Issue reported', timestamp: new Date() }],
    },
  ];

  for (const issueData of issues) {
    const createdAt = new Date(Date.now() - Math.random() * 86400000 * 14);
    const { PriorityPolicy } = await import('./domain/policies/PriorityPolicy');
    const priority_score = PriorityPolicy.calculateScore({
      severity: issueData.severity,
      votes: issueData.votes,
      hazardous: issueData.hazardous,
      createdAt,
    });
    await issueRepository.create({ ...issueData, priority_score, createdAt });
  }

  console.error('[Seed] Created 8 issues');
  console.error('[Seed] ✅ Done! Seeded 2 users and 8 issues around Bikaner');
  console.error('[Seed] Login: rahul@demo.com / demo123  |  priya@demo.com / demo123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
