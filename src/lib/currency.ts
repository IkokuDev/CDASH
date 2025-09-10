/**
 * Currency utility functions for handling currency conversion and formatting
 */

// List of supported currencies
export const supportedCurrencies = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
];

/**
 * Format a currency value according to the specified currency code
 * @param value - The numeric value to format
 * @param currencyCode - The ISO currency code (e.g., 'NGN', 'USD')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number,
  currencyCode: string = 'NGN',
  options: Intl.NumberFormatOptions = {}
): string {
  // Map of currency codes to locales for better formatting
  const localeMap: Record<string, string> = {
    NGN: 'en-NG',
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    INR: 'en-IN',
    ZAR: 'en-ZA',
    GHS: 'en-GH',
    KES: 'en-KE',
  };

  const locale = localeMap[currencyCode] || 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    ...options,
  }).format(value);
}

/**
 * Convert an amount from one currency to another
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Promise resolving to the converted amount
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  try {
    // Skip conversion if currencies are the same
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await fetch('/api/currency', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        fromCurrency,
        toCurrency,
      }),
    });

    if (!response.ok) {
      throw new Error('Currency conversion failed');
    }

    const data = await response.json();
    return data.convertedAmount;
  } catch (error) {
    console.error('Error converting currency:', error);
    // Return original amount if conversion fails
    return amount;
  }
}

/**
 * Get the exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Promise resolving to the exchange rate
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  try {
    // Return 1 if currencies are the same
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const response = await fetch('/api/currency');
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const rates = await response.json();
    
    // Calculate exchange rate (through NGN as base)
    if (rates[fromCurrency] && rates[toCurrency]) {
      return rates[toCurrency] / rates[fromCurrency];
    }
    
    throw new Error('Invalid currency code');
  } catch (error) {
    console.error('Error getting exchange rate:', error);
    // Return 1 (no conversion) if fetching rate fails
    return 1;
  }
}