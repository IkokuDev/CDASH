import { NextResponse } from 'next/server';
import prisma, { Prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get the organization profile (assuming there's only one)
    const profile = await prisma.organizationProfile.findFirst({
      include: {
        turnovers: true
      }
    });

    // If no profile exists, return an empty object with empty turnovers array
    if (!profile) {
      return NextResponse.json({ name: '', address: '', turnovers: [] });
    }

    // Format the response to match the expected OrganizationProfile type
    const formattedProfile = {
      name: profile.name,
      address: profile.address || '',
      logoUrl: profile.logo_url || undefined,
      turnovers: profile.turnovers.map((t: { year: number; amount: number }) => ({
        year: t.year,
        amount: t.amount
      }))
    };

    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error('Error fetching organization profile:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check if a profile already exists
    const existingProfile = await prisma.organizationProfile.findFirst();
    
    let profile: Prisma.OrganizationProfileGetPayload<{
      include: { turnovers: true }
    }>;
    
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.organizationProfile.update({
        where: { id: existingProfile.id },
        data: {
          name: data.name,
          address: data.address,
          logo_url: data.logoUrl
        },
        include: {
          turnovers: true
        }
      });
      
      // Handle turnovers update if provided
      if (data.turnovers && Array.isArray(data.turnovers)) {
        // Delete existing turnovers and create new ones
        await prisma.turnovers.deleteMany({
          where: { org_id: profile.id }
        });
        
        // Create new turnovers
        await Promise.all(data.turnovers.map((turnover: { year: number; amount: number }) => {
          return prisma.turnovers.create({
            data: {
              year: turnover.year,
              amount: turnover.amount,
              org_id: profile.id
            }
          });
        }));
        
        // Fetch updated profile with new turnovers
        const updatedProfile = await prisma.organizationProfile.findUnique({
          where: { id: profile.id },
          include: { turnovers: true }
        });
        
        // Make sure we have a non-null profile
        if (!updatedProfile) {
          throw new Error('Failed to fetch updated profile');
        }
        
        profile = updatedProfile;
      }
    } else {
      // Create new profile
      profile = await prisma.organizationProfile.create({
        data: {
          name: data.name,
          address: data.address,
          logo_url: data.logoUrl,
          turnovers: {
            create: data.turnovers?.map((t: { year: number; amount: number }) => ({
              year: t.year,
              amount: t.amount
            })) || []
          }
        },
        include: {
          turnovers: true
        }
      });
    }

    // Format the response
    const formattedProfile = {
      name: profile.name,
      address: profile.address || '',
      logoUrl: profile.logo_url || undefined,
      turnovers: profile.turnovers.map((t: { year: number; amount: number }) => ({
        year: t.year,
        amount: t.amount
      }))
    };

    return NextResponse.json(formattedProfile);
  } catch (error) {
    console.error('Error updating organization profile:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error && error.message.includes('validation')) {
      errorMessage = 'Invalid data provided.';
    }
    return NextResponse.json({ message: errorMessage, details: error instanceof Error ? error.message : '' }, { status: 500 });
  }
}

export const revalidate = 0;