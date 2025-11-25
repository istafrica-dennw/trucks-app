import * as reportService from '../services/reportService.js';

export const dailyReport = async (req, res, next) => {
  try {
    const { truckId, customerId } = req.query;
    const data = await reportService.getDailyReport(req.params.date, truckId, customerId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const weeklyReport = async (req, res, next) => {
  try {
    const { truckId, customerId } = req.query;
    const data = await reportService.getWeeklyReport(req.params.week, truckId, customerId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const monthlyReport = async (req, res, next) => {
  try {
    const { truckId, customerId } = req.query;
    const data = await reportService.getMonthlyReport(req.params.month, truckId, customerId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const customReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy, truckId, customerId } = req.query;
    
    // Try alternative ways to get truckId in case Express doesn't parse it correctly
    const truckIdAlt1 = req.query.truckId;
    const truckIdAlt2 = req.query['truckId'];
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const truckIdFromUrl = urlParams.get('truckId');
    const customerIdFromUrl = urlParams.get('customerId');
    
    // Use the truckId that actually has a value
    const finalTruckId = truckId || truckIdAlt1 || truckIdAlt2 || truckIdFromUrl || null;
    const finalCustomerId = customerId || customerIdFromUrl || null;
    
    const data = await reportService.getCustomReport(startDate, endDate, groupBy, finalTruckId, finalCustomerId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const summaryReport = async (req, res, next) => {
  try {
    const { truckId, customerId } = req.query;
    const data = await reportService.getSummary(truckId, customerId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

