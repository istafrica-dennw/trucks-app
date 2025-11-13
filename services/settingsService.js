import Settings from '../models/Settings.js';

export const getSettings = async () => {
  try {
    const settings = await Settings.getSettings();
    return settings;
  } catch (error) {
    throw new Error(`Failed to get settings: ${error.message}`);
  }
};

export const updateExchangeRates = async (exchangeRates, updatedBy) => {
  try {
    const settings = await Settings.getSettings();
    
    // Validate exchange rates
    const validCurrencies = ['USD', 'RWF', 'UGX', 'TZX'];
    for (const currency of validCurrencies) {
      if (exchangeRates[currency] !== undefined) {
        if (typeof exchangeRates[currency] !== 'number' || exchangeRates[currency] <= 0) {
          throw new Error(`Invalid exchange rate for ${currency}. Must be a positive number.`);
        }
      }
    }
    
    // Update exchange rates
    if (exchangeRates.USD !== undefined) settings.exchangeRates.USD = exchangeRates.USD;
    if (exchangeRates.RWF !== undefined) settings.exchangeRates.RWF = exchangeRates.RWF;
    if (exchangeRates.UGX !== undefined) settings.exchangeRates.UGX = exchangeRates.UGX;
    if (exchangeRates.TZX !== undefined) settings.exchangeRates.TZX = exchangeRates.TZX;
    
    settings.updatedBy = updatedBy;
    settings.updatedAt = new Date();
    
    await settings.save();
    return settings;
  } catch (error) {
    throw new Error(`Failed to update exchange rates: ${error.message}`);
  }
};


