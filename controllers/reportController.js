import * as reportService from '../services/reportService.js';

export const dailyReport = async (req, res, next) => {
  try {
    const { truckId } = req.query;
    const data = await reportService.getDailyReport(req.params.date, truckId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const weeklyReport = async (req, res, next) => {
  try {
    const { truckId } = req.query;
    const data = await reportService.getWeeklyReport(req.params.week, truckId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const monthlyReport = async (req, res, next) => {
  try {
    const { truckId } = req.query;
    const data = await reportService.getMonthlyReport(req.params.month, truckId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const customReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy, truckId } = req.query;
    
    // Try alternative ways to get truckId in case Express doesn't parse it correctly
    const truckIdAlt1 = req.query.truckId;
    const truckIdAlt2 = req.query['truckId'];
    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
    const truckIdFromUrl = urlParams.get('truckId');
    
    // Use the truckId that actually has a value
    const finalTruckId = truckId || truckIdAlt1 || truckIdAlt2 || truckIdFromUrl || null;
    
    const data = await reportService.getCustomReport(startDate, endDate, groupBy, finalTruckId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

export const summaryReport = async (req, res, next) => {
  try {
    const { truckId } = req.query;
    const data = await reportService.getSummary(truckId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

