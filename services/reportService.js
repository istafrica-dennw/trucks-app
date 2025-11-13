import Drive from '../models/Drive.js';

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d) { const x = new Date(d); x.setHours(23,59,59,999); return x; }

export async function getDailyReport(date, truckId = null) {
  const start = startOfDay(date);
  const end = endOfDay(date);
  const query = { date: { $gte: start, $lte: end } };
  if (truckId) query.truck = truckId;
  const drives = await Drive.find(query);
  return summarize(drives, { date: start.toISOString().slice(0,10) });
}

export async function getWeeklyReport(isoWeek, truckId = null) {
  // isoWeek format: YYYY-Www
  const [year, week] = isoWeek.split('-W').map(Number);
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  const firstWeekStart = new Date(firstThursday);
  firstWeekStart.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7));
  const start = new Date(firstWeekStart);
  start.setUTCDate(start.getUTCDate() + (week - 1) * 7);
  const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6); end.setUTCHours(23,59,59,999);
  const query = { date: { $gte: start, $lte: end } };
  if (truckId) query.truck = truckId;
  const drives = await Drive.find(query);
  const summary = summarize(drives, { week: isoWeek, startDate: start.toISOString().slice(0,10), endDate: end.toISOString().slice(0,10) });
  return summary;
}

export async function getMonthlyReport(month, truckId = null) {
  // month format: YYYY-MM
  const [y, m] = month.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  const query = { date: { $gte: start, $lte: end } };
  if (truckId) query.truck = truckId;
  const drives = await Drive.find(query);
  return summarize(drives, { month });
}

export async function getCustomReport(startDate, endDate, groupBy = 'day', truckId = null) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);
  const query = { date: { $gte: start, $lte: end } };
  if (truckId) query.truck = truckId;
  const drives = await Drive.find(query);
  const base = summarize(drives, { startDate: start.toISOString().slice(0,10), endDate: end.toISOString().slice(0,10) });
  if (groupBy === 'day') {
    const map = new Map();
    drives.forEach(d => {
      const key = new Date(d.date).toISOString().slice(0,10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    });
    base.breakdown = Array.from(map.entries()).map(([date, arr]) => {
      const breakdownData = calc(arr);
      return { date, ...breakdownData };
    });
  }
  return base;
}

export async function getSummary(truckId = null) {
  const query = {};
  if (truckId) query.truck = truckId;
  const drives = await Drive.find(query);
  return { overall: calc(drives) };
}

function summarize(drives, meta = {}) {
  return { ...meta, summary: calc(drives) };
}

// Helper function to convert amount to RWF
function convertToRWF(amount, currency, exchangeRate) {
  if (!amount || !currency) return 0;
  if (currency === 'RWF') return amount;
  return amount * (exchangeRate || 1);
}

function calc(drives) {
  const totalDrives = drives.length;
  let totalAmount = 0, totalExpenses = 0, totalPaid = 0;
  const exchangeRates = {}; // Track exchange rates used
  
  drives.forEach(d => {
    const currency = d.pay?.currency || 'RWF';
    const exchangeRate = d.pay?.exchangeRate || 1;
    
    // Track exchange rates for display
    if (currency !== 'RWF' && !exchangeRates[currency]) {
      exchangeRates[currency] = exchangeRate;
    }
    
    // Convert amounts to RWF
    const amountInRWF = convertToRWF(d.pay?.totalAmount || 0, currency, exchangeRate);
    totalAmount += amountInRWF;
    
    // Expenses are always in RWF (or convert if needed)
    if (Array.isArray(d.expenses)) {
      totalExpenses += d.expenses.reduce((s,e)=>s+(e.amount||0),0);
    }
    
    // Convert paid amounts to RWF
    if (d.pay?.paidOption === 'full') {
      totalPaid += convertToRWF(d.pay.totalAmount || 0, currency, exchangeRate);
    } else if (Array.isArray(d.pay?.installments)) {
      totalPaid += d.pay.installments.reduce((s,i)=>s+convertToRWF(i.amount||0, currency, exchangeRate),0);
    }
  });
  
  const netProfit = totalPaid - totalExpenses; // paid minus expenses (cash perspective)
  return { 
    totalDrives, 
    totalAmount, // in RWF
    totalExpenses, // in RWF
    totalPaid, // in RWF
    netProfit, // in RWF
    exchangeRates // Exchange rates used for display
  };
}

