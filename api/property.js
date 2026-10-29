export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET for property lookup.' });
  const address = typeof req.query.address === 'string' ? req.query.address.trim() : '';
  if (address.length < 8 || address.length > 220) return res.status(400).json({ error: 'Enter a full property address (street, city, state, and ZIP if available).' });
  if (!(/\bNY\b|New York/i.test(address))) return res.status(400).json({ error: 'This first version is configured for New York State addresses. Include NY in the address.' });
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'The site administrator must add RENTCAST_API_KEY in the hosting environment settings.' });
  async function rentcast(path, params) {
    const url = new URL('https://api.rentcast.io/v1/' + path);
    for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    const r = await fetch(url, { headers: { Accept: 'application/json', 'X-Api-Key': apiKey } });
    if (!r.ok) throw new Error('Provider returned HTTP ' + r.status);
    return r.json();
  }
  const outcomes = await Promise.allSettled([
    rentcast('properties', { address, limit: 1 }),
    rentcast('avm/value', { address, compCount: 5 }),
    rentcast('avm/rent/long-term', { address, compCount: 5 })
  ]);
  const record = outcomes[0].status === 'fulfilled' ? outcomes[0].value : null;
  const value = outcomes[1].status === 'fulfilled' ? outcomes[1].value : null;
  const rent = outcomes[2].status === 'fulfilled' ? outcomes[2].value : null;
  const property = Array.isArray(record) ? record[0] : null;
  if (!property && !value && !rent) return res.status(502).json({ error: 'No data was returned. Check the address, API plan, and monthly request allowance.' });
  const safeProperty = property ? {
    formattedAddress: property.formattedAddress, propertyType: property.propertyType,
    bedrooms: property.bedrooms, bathrooms: property.bathrooms, squareFootage: property.squareFootage,
    lotSize: property.lotSize, yearBuilt: property.yearBuilt, lastSaleDate: property.lastSaleDate,
    lastSalePrice: property.lastSalePrice, propertyTaxes: property.propertyTaxes
  } : null;
  return res.status(200).json({
    property: safeProperty,
    valueEstimate: value ? { price: value.price, priceRangeLow: value.priceRangeLow, priceRangeHigh: value.priceRangeHigh,
      comparables: Array.isArray(value.comparables) ? value.comparables.slice(0,5).map(c => ({ formattedAddress:c.formattedAddress, price:c.price, distance:c.distance, status:c.status, listedDate:c.listedDate })) : [] } : null,
    rentEstimate: rent ? { rent: rent.rent, rentRangeLow: rent.rentRangeLow, rentRangeHigh: rent.rentRangeHigh,
      comparables: Array.isArray(rent.comparables) ? rent.comparables.slice(0,5).map(c => ({ formattedAddress:c.formattedAddress, price:c.price, distance:c.distance, status:c.status, listedDate:c.listedDate })) : [] } : null,
    warnings: outcomes.map((o,i) => o.status === 'rejected' ? ['property records','value estimate','rent estimate'][i] + ' unavailable' : null).filter(Boolean)
  });
}