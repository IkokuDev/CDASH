import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.assets.findMany(); // Changed from 'asset' to 'assets'
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newAsset = await prisma.assets.create({ // Changed from 'asset' to 'assets'
      data: {
        name: data.name,
        type: data.type,
        summary: data.summary, // Changed from 'description' to 'summary'
        acquired: new Date(data.acquired),
        cost: data.cost,
        status: data.status,
        purpose: data.purpose,
        technical_details: data.technicalDetails,
        sub_category: data.subCategory,
        recurrent_expenditure: data.recurrentExpenditure,
      },
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error('Error creating asset:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error && error.message.includes('validation')) {
      errorMessage = 'Invalid data provided.';
    }
    return NextResponse.json({ message: errorMessage, details: error instanceof Error ? error.message : '' }, { status: 500 });
  }
}

export const revalidate = 0;