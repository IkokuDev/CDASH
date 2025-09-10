// Script to seed organization profile data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if organization profile already exists
    const existingProfile = await prisma.organizationProfile.findFirst();
    
    if (!existingProfile) {
      console.log('Creating organization profile...');
      
      // Create organization profile
      const profile = await prisma.organizationProfile.create({
        data: {
          name: 'CDASH Corporation',
          address: '123 Tech Avenue, Lagos, Nigeria',
          logo_url: '/logo.png',
          turnovers: {
            create: [
              { year: 2020, amount: 1500000 },
              { year: 2021, amount: 2200000 },
              { year: 2022, amount: 3100000 },
              { year: 2023, amount: 4500000 }
            ]
          }
        }
      });
      
      console.log('Organization profile created:', profile);
    } else {
      console.log('Organization profile already exists. Skipping creation.');
    }
    
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding organization profile:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();