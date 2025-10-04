export interface OCRResult {
  amount?: number;
  currency?: string;
  date?: string;
  description?: string;
  confidence: number;
}

export async function simulateOCR(file: File): Promise<OCRResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const filename = file.name.toLowerCase();

  const amountMatch = filename.match(/(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

  const currencyMatch = filename.match(/(usd|eur|gbp|cad|aud|jpy|chf|inr)/i);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'USD';

  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})|(\d{2}-\d{2}-\d{4})/);
  const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0];

  return {
    amount,
    currency,
    date,
    description: `Receipt from ${file.name}`,
    confidence: 0.85,
  };
}

export function normalizeAmount(input: string): number | null {
  const cleaned = input.replace(/[,$]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function normalizeCurrency(input: string): string {
  const currencyMap: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR',
  };

  return currencyMap[input] || input.toUpperCase();
}
