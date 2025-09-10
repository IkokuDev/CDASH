import { NextResponse } from 'next/server';

// This is a simple API to get currency exchange rates
// In a production environment, you would use a real currency API service
// like Open Exchange Rates, Fixer.io, or Exchange Rates API

// Mock exchange rates (relative to NGN)
// In a real implementation, these would come from an external API
const exchangeRates = {
  NGN: 1,       // Nigerian Naira (base currency)
  USD: 0.00067, // US Dollar
  EUR: 0.00062, // Euro
  GBP: 0.00053, // British Pound
  JPY: 0.10,    // Japanese Yen
  CNY: 0.0048,  // Chinese Yuan
  INR: 0.056,   // Indian Rupee
  ZAR: 0.012,   // South African Rand
  GHS: 0.0085,  // Ghanaian Cedi
  KES: 0.086    // Kenyan Shilling
};

// GET handler to fetch all available exchange rates
export async function GET() {
  try {
    return NextResponse.json(exchangeRates);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}

// POST handler to convert between currencies
export async function POST(request: Request) {
  try {
    const { amount, fromCurrency, toCurrency } = await request.json();
    
    // Validate input
    if (!amount || !fromCurrency || !toCurrency) {
      return NextResponse.json(
        { message: 'Missing required parameters: amount, fromCurrency, toCurrency' },
        { status: 400 }
      );
    }
    
    if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
      return NextResponse.json(
        { message: 'Invalid currency code' },
        { status: 400 }
      );
    }
    
    // Convert to NGN first (our base currency)
    const amountInNGN = amount / exchangeRates[fromCurrency];
    
    // Then convert from NGN to target currency
    const convertedAmount = amountInNGN * exchangeRates[toCurrency];
    
    return NextResponse.json({
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      exchangeRate: exchangeRates[toCurrency] / exchangeRates[fromCurrency]
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', details: error instanceof Error ? error.message : '' },
      { status: 500 }
    );
  }
}