import axios from 'axios';
import { getRatesCookie, setRatesCookie, isRateCacheValid } from './cookieStore';
import type { CurrencyRate } from '../types';

const EXCHANGERATE_API = 'https://api.exchangerate-api.com/v4/latest';

export async function getExchangeRates(baseCurrency: string): Promise<CurrencyRate> {
  const cached = getRatesCookie(baseCurrency);

  if (cached && isRateCacheValid(cached)) {
    return cached;
  }

  try {
    const response = await axios.get(`${EXCHANGERATE_API}/${baseCurrency}`);
    const rates: CurrencyRate = {
      base: baseCurrency,
      rates: response.data.rates,
      lastUpdated: new Date().toISOString(),
    };

    setRatesCookie(baseCurrency, rates);
    return rates;
  } catch (error) {
    if (cached) {
      console.warn('Using stale exchange rate cache due to API error');
      return cached;
    }

    const usdRates = getRatesCookie('USD');
    if (usdRates && baseCurrency !== 'USD') {
      console.warn('Falling back to USD conversion');
      return usdRates;
    }

    throw new Error('Unable to fetch exchange rates and no cache available');
  }
}

export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{ convertedAmount: number; rate: number }> {
  if (fromCurrency === toCurrency) {
    return { convertedAmount: amount, rate: 1 };
  }

  try {
    const rates = await getExchangeRates(fromCurrency);
    const rate = rates.rates[toCurrency];

    if (!rate) {
      throw new Error(`Rate not found for ${toCurrency}`);
    }

    return {
      convertedAmount: amount * rate,
      rate,
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    return { convertedAmount: amount, rate: 1 };
  }
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
