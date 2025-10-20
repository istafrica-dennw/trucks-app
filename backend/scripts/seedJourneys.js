/*
  Seed 70 journeys per truck (2023-2025) using backend APIs.
  - Mix full and installment payments (2-4 installments)
  - East African cities; routes form logical consecutive hops
  - Dates progress forward; no same-day double-booking for a driver
*/

import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_BASE || 'http://localhost:5001';

const cities = [
  'Kigali', 'Bujumbura', 'Bukavu', 'Goma', 'Kampala', 'Jinja', 'Mbarara', 'Kahama', 'Dodoma', 'Dar es salam', 'Nairobi'
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function nextCity(current) {
  const idx = cities.findIndex(c => c.toLowerCase() === current.toLowerCase());
  if (idx === -1) return randomChoice(cities);
  // move forward or backward by 1 to simulate sensible path
  const dir = Math.random() < 0.5 ? -1 : 1;
  let nextIdx = idx + dir;
  if (nextIdx < 0) nextIdx = 1; // bounce
  if (nextIdx >= cities.length) nextIdx = cities.length - 2;
  return cities[nextIdx];
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0,0,0,0);
  return d;
}

function generateExpenses() {
  const items = [
    { title: 'fuel', min: 150, max: 600 },
    { title: 'toll', min: 5, max: 30 },
    { title: 'meal', min: 10, max: 40 },
    { title: 'maintenance', min: 20, max: 120 }
  ];
  const count = randomInt(1, 3);
  const chosen = [];
  for (let i = 0; i < count; i++) {
    const it = randomChoice(items);
    chosen.push({ title: it.title, amount: randomInt(it.min, it.max), note: '' });
  }
  return chosen;
}

function generatePayment(total) {
  const paidOption = Math.random() < 0.5 ? 'full' : 'installment';
  if (paidOption === 'full') {
    return { totalAmount: total, paidOption, installments: [] };
  }
  const num = randomInt(2, 4);
  const parts = [];
  // split total into num parts with slight variation
  let remaining = total;
  for (let i = 0; i < num; i++) {
    const left = num - i;
    let amt = i === num - 1 ? remaining : Math.max(0, Math.round((remaining / left) * (0.8 + Math.random() * 0.4)));
    remaining -= amt;
    parts.push({ amount: amt, note: i === 0 ? 'advance' : '' });
  }
  return { totalAmount: total, paidOption, installments: parts };
}

async function login() {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: process.env.DEFAULT_ADMIN_EMAIL || 'admin@trucksapp.com', password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123' })
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  return data.token;
}

async function fetchJSON(path, token) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let url = `${API_BASE}${path}`;
  if (path.includes('/api/') && !(/[?&]limit=/.test(path))) {
    const sep = path.includes('?') ? '&' : '?';
    url = `${API_BASE}${path}${sep}limit=100`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch ${path} failed: ${res.status} ${res.statusText} ${text}`);
  }
  const data = await res.json();
  return data.data || data;
}

async function fetchAll(pathBase, token) {
  let page = 1;
  const all = [];
  // Try up to 50 pages
  for (;;) {
    const sep = pathBase.includes('?') ? '&' : '?';
    // some endpoints return {data, pagination}, others may return plain array
    const res = await fetchJSON(`${pathBase}${sep}page=${page}&limit=100`, token);
    const items = Array.isArray(res) ? res : (res.items || res.data || res);
    if (!items || items.length === 0) break;
    all.push(...items);
    if (items.length < 100) break;
    page += 1;
    if (page > 50) break;
  }
  return all;
}

async function createJourney(token, body) {
  const res = await fetch(`${API_BASE}/api/drives`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) {
    if (res.status === 429) {
      // rate limited
      await new Promise(r => setTimeout(r, 5000));
      return createJourney(token, body);
    }
    console.error('Create failed', res.status, json);
    throw new Error(json?.message || `Create drive failed (${res.status})`);
  }
  return json.data;
}

async function main() {
  console.log('Seeding journeys...');
  const token = await login();
  const trucks = await fetchAll('/api/trucks', token);
  const drivers = await fetchAll('/api/drivers', token);

  if (!trucks || trucks.length === 0) throw new Error('No trucks found');
  if (!drivers || drivers.length === 0) throw new Error('No drivers found');

  // Assign a primary driver per truck to avoid cross-overlaps
  const driverPerTruck = trucks.map((t, idx) => drivers[idx % drivers.length]);

  for (let tIndex = 0; tIndex < trucks.length; tIndex++) {
    const truck = trucks[tIndex];
    const primaryDriver = driverPerTruck[tIndex];

    let currentCity = randomChoice(cities);
    let currentDate = new Date('2023-01-05T00:00:00Z');
    const journeysToCreate = 70;

    for (let j = 0; j < journeysToCreate; j++) {
      const departureCity = currentCity;
      const destinationCity = nextCity(departureCity);
      const cargo = randomChoice(['cement', 'steel', 'timber', 'maize', 'flour', 'electronics', 'furniture']);
      const customer = randomChoice(['Organi Ltd', 'TransEA', 'Lake Freight', 'Kivu Logistics', 'Nile Trade']);

      const expenses = generateExpenses();
      const totalAmount = randomInt(800, 3000);
      const pay = generatePayment(totalAmount);

      const body = {
        driver: primaryDriver._id,
        truck: truck._id,
        departureCity,
        destinationCity,
        cargo,
        customer,
        expenses,
        pay,
        notes: '',
        status: Math.random() < 0.8 ? 'completed' : 'started',
        date: currentDate.toISOString().split('T')[0]
      };

      await createJourney(token, body);
      // Gentle pacing to avoid rate limit
      await new Promise(r => setTimeout(r, 200));

      // Prepare next leg
      currentCity = destinationCity;
      currentDate = addDays(currentDate, randomInt(6, 14)); // spacing between trips
      if (currentDate.getFullYear() > 2025) currentDate = new Date('2025-12-20T00:00:00Z');
    }
    console.log(`Truck ${truck.plateNumber}: 70 journeys created`);
  }

  console.log('Seeding journeys done');
}

// Use global fetch (Node >=18)
// eslint-disable-next-line no-undef
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

