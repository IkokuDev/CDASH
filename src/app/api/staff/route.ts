import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const staff = await prisma.staff.findMany();
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newStaff = await prisma.staff.create({
      data: {
        name: data.name,
        position: data.position,
        joined_date: new Date(data.joined_date),
        experience: data.experience,
        salary: data.salary,
        qualifications_score: data.qualifications_score,
        bio: data.bio,
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error && error.message.includes('validation')) {
      errorMessage = 'Invalid data provided.';
    }
    return NextResponse.json({ message: errorMessage, details: error instanceof Error ? error.message : '' }, { status: 500 });
  }
}

export const revalidate = 0;