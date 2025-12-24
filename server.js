const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const REST_API_KEY = process.env.REST_COUNTRIES_API_KEY || '';
const NEWS_API_KEY = process.env.NEWS_API_KEY || '';
const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY || '';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function fetchRandomUser() {
  const res = await axios.get('https://randomuser.me/api/');
  return res.data.results[0];
}

async function fetchCountryInfo(countryName) {
  try {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;
    const headers = REST_API_KEY ? { 'X-API-KEY': REST_API_KEY } : {};
    const res = await axios.get(url, { headers });
    const data = res.data && res.data[0];
    if (!data) return null;

    const name = data.name && (data.name.common || data.name.official) || countryName;
    const capital = Array.isArray(data.capital) ? data.capital[0] : (data.capital || 'N/A');
    const languages = data.languages ? Object.values(data.languages).join(', ') : 'N/A';
    const currenciesRaw = data.currencies || {};
    const currencyCode = Object.keys(currenciesRaw)[0] || null;
    const currency = currencyCode ? `${currencyCode} (${currenciesRaw[currencyCode].name || ''})` : 'N/A';
    const flag = data.flags && (data.flags.svg || data.flags.png) || null;

    return { name, capital, languages, currencyCode, currency, flag };
  } catch (err) {
    return null;
  }
}

async function fetchExchangeRates(baseCurrency) {
  if (!baseCurrency) return null;
  try {
    // If EXCHANGE_API_KEY is provided, try exchangerate-api.com; otherwise use exchangerate.host as fallback
    if (EXCHANGE_API_KEY) {
      const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${baseCurrency}`;
      const res = await axios.get(url);
      const rates = res.data && res.data.conversion_rates ? res.data.conversion_rates : {};
      return { USD: rates['USD'] || null, KZT: rates['KZT'] || null };
    } else {
      const url = `https://api.exchangerate.host/latest?base=${encodeURIComponent(baseCurrency)}&symbols=USD,KZT`;
      const res = await axios.get(url);
      const rates = res.data && res.data.rates ? res.data.rates : {};
      return { USD: rates['USD'] || null, KZT: rates['KZT'] || null };
    }
  } catch (err) {
    return null;
  }
}

async function fetchNewsForCountry(countryName) {
  if (!NEWS_API_KEY) return [];
  try {
    const q = encodeURIComponent(`\"${countryName}\"`);
    const url = `https://newsapi.org/v2/everything?q=${q}&language=en&pageSize=5&apiKey=${NEWS_API_KEY}`;
    const res = await axios.get(url);
    const articles = (res.data && res.data.articles) || [];
    // Map to required fields and ensure headline contains country name (case-insensitive)
    const filtered = articles.filter(a => (a.title || '').toLowerCase().includes(countryName.toLowerCase()));
    const list = (filtered.length ? filtered : articles).slice(0,5).map(a => ({
      title: a.title || 'No title',
      image: a.urlToImage || null,
      description: a.description || '',
      url: a.url || ''
    }));
    return list;
  } catch (err) {
    return [];
  }
}

app.get('/api/random-user', async (req, res) => {
  try {
    const ru = await fetchRandomUser();
    if (!ru) return res.status(502).json({ error: 'Failed to get random user' });

    const user = {
      firstName: ru.name.first,
      lastName: ru.name.last,
      gender: ru.gender,
      picture: ru.picture && ru.picture.large,
      age: ru.dob && ru.dob.age,
      dateOfBirth: ru.dob && ru.dob.date,
      city: ru.location && ru.location.city,
      country: ru.location && ru.location.country,
      fullAddress: (() => {
        const street = ru.location && ru.location.street;
        if (!street) return 'N/A';
        const num = street.number || '';
        const name = street.name || '';
        return `${name} ${num}`.trim();
      })(),
    };

    const countryInfo = await fetchCountryInfo(user.country);
    const exchange = countryInfo && countryInfo.currencyCode ? await fetchExchangeRates(countryInfo.currencyCode) : null;
    const news = await fetchNewsForCountry(user.country);

    const payload = {
      user,
      country: countryInfo,
      exchange,
      news
    };

    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
