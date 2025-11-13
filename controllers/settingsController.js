import * as settingsService from '../services/settingsService.js';
import logger from '../utils/logger.js';

export const getSettingsController = async (req, res) => {
  try {
    const settings = await settingsService.getSettings();
    
    res.status(200).json({
      success: true,
      data: {
        exchangeRates: settings.exchangeRates,
        updatedBy: settings.updatedBy,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error in getSettingsController', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
      error: error.message
    });
  }
};

export const updateExchangeRatesController = async (req, res) => {
  try {
    const { exchangeRates } = req.body;
    
    if (!exchangeRates || typeof exchangeRates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Exchange rates object is required'
      });
    }
    
    const updatedSettings = await settingsService.updateExchangeRates(
      exchangeRates,
      req.user._id
    );
    
    res.status(200).json({
      success: true,
      message: 'Exchange rates updated successfully',
      data: {
        exchangeRates: updatedSettings.exchangeRates,
        updatedBy: updatedSettings.updatedBy,
        updatedAt: updatedSettings.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error in updateExchangeRatesController', { error: error.message });
    
    if (error.message.includes('Invalid exchange rate')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update exchange rates',
      error: error.message
    });
  }
};


