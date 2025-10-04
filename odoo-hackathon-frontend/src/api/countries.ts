import axios from 'axios';
import type { Country } from '../types';

const RESTCOUNTRIES_API = 'https://restcountries.com/v3.1/all?fields=name,currencies';

export async function fetchCountries(): Promise<Country[]> {
  try {
    const response = await axios.get(RESTCOUNTRIES_API);

    const countries: Country[] = response.data.map((country: any) => {
      const currencies = country.currencies
        ? Object.keys(country.currencies)
        : [];

      return {
        name: country.name?.common || 'Unknown',
        currencies,
      };
    }).filter((c: Country) => c.currencies.length > 0);

    return countries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return getFallbackCountries();
  }
}

function getFallbackCountries(): Country[] {
  return [
    { name: 'United States', currencies: ['USD'] },
    { name: 'United Kingdom', currencies: ['GBP'] },
    { name: 'European Union', currencies: ['EUR'] },
    { name: 'Canada', currencies: ['CAD'] },
    { name: 'Australia', currencies: ['AUD'] },
    { name: 'Japan', currencies: ['JPY'] },
    { name: 'Switzerland', currencies: ['CHF'] },
    { name: 'India', currencies: ['INR'] },
  ];
}
