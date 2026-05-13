#!/usr/bin/env node
// Scrapes all 19 Nepal Dhamma center schedule pages and writes src/data/courses.json.
// Usage: node scripts/scrape-courses.js

const https = require('https');
const fs = require('fs');
const path = require('path');

const NEPAL_CENTERS = {
  schshringa: {
    name: 'Dhamma Shringa',
    centerId: 'dhamma-shringa',
    city: 'Budhanilkantha, Kathmandu',
    region: 'Kathmandu Valley',
    altitude: 1337,
    lat: 27.77,
    lng: 85.36,
  },
  schpokhara: {
    name: 'Dhamma Pokhara',
    centerId: 'dhamma-pokhara',
    city: 'Pokhara',
    region: 'Pokhara & Gandaki',
    altitude: 827,
    lat: 28.21,
    lng: 83.99,
  },
  schadhara: {
    name: 'Dhamma Adhara',
    centerId: 'dhamma-adhara',
    city: 'Lumbini',
    region: 'Lumbini & Terai',
    altitude: 95,
    lat: 27.48,
    lng: 83.27,
  },
  schjanani: {
    name: 'Dhamma Janani',
    centerId: 'dhamma-janani',
    city: 'Chitwan',
    region: 'Lumbini & Terai',
    altitude: 210,
    lat: 27.63,
    lng: 84.43,
  },
  schagara: {
    name: 'Dhamma Agara',
    centerId: 'dhamma-agara',
    city: 'Lalitpur',
    region: 'Kathmandu Valley',
    altitude: 1350,
    lat: 27.66,
    lng: 85.32,
  },
  schasaya: {
    name: 'Dhamma Asaya',
    centerId: 'dhamma-asaya',
    city: 'Nepal',
    region: 'Kathmandu Valley',
    altitude: 1300,
    lat: 27.7,
    lng: 85.3,
  },
  schbirata: {
    name: 'Dhamma Birata',
    centerId: 'dhamma-birata',
    city: 'Biratnagar',
    region: 'Koshi & East Nepal',
    altitude: 72,
    lat: 26.45,
    lng: 87.27,
  },
  schcitavana: {
    name: 'Dhamma Citavana',
    centerId: 'dhamma-citavana',
    city: 'Chitwan',
    region: 'Lumbini & Terai',
    altitude: 200,
    lat: 27.55,
    lng: 84.35,
  },
  schgama: {
    name: 'Dhamma Gama',
    centerId: 'dhamma-gama',
    city: 'Nepal',
    region: 'Kathmandu Valley',
    altitude: 1300,
    lat: 27.7,
    lng: 85.25,
  },
  schkitti: {
    name: 'Dhamma Kitti',
    centerId: 'dhamma-kitti',
    city: 'Kirtipur, Kathmandu',
    region: 'Kathmandu Valley',
    altitude: 1300,
    lat: 27.67,
    lng: 85.28,
  },
  schnandana: {
    name: 'Dhamma Nandana',
    centerId: 'dhamma-nandana',
    city: 'Banganga Municipality',
    region: 'Lumbini & Terai',
    altitude: 100,
    lat: 27.7,
    lng: 83.5,
  },
  schnibha: {
    name: 'Dhamma Nibha',
    centerId: 'dhamma-nibha',
    city: 'Kakani Village',
    region: 'Kathmandu Valley',
    altitude: 2073,
    lat: 27.84,
    lng: 85.17,
  },
  schparaga: {
    name: 'Dhamma Paraga',
    centerId: 'dhamma-paraga',
    city: 'Ghorahi, Dang',
    region: 'Lumbini & Terai',
    altitude: 230,
    lat: 28.04,
    lng: 82.49,
  },
  schsagar: {
    name: 'Dhamma Sagar',
    centerId: 'dhamma-sagar',
    city: 'Lukla',
    region: 'Koshi & East Nepal',
    altitude: 2860,
    lat: 27.69,
    lng: 86.73,
  },
  schsisa: {
    name: 'Dhamma Sisa',
    centerId: 'dhamma-sisa',
    city: 'Tansen, Palpa',
    region: 'Pokhara & Gandaki',
    altitude: 1372,
    lat: 27.87,
    lng: 83.55,
  },
  schsurakhetta: {
    name: 'Dhamma Surakhetta',
    centerId: 'dhamma-surakhetta',
    city: 'Surkhet',
    region: 'Karnali & West Nepal',
    altitude: 724,
    lat: 28.6,
    lng: 81.61,
  },
  schsuriyo: {
    name: 'Dhamma Suriyo',
    centerId: 'dhamma-suriyo',
    city: 'Ilam District',
    region: 'Koshi & East Nepal',
    altitude: 1200,
    lat: 26.91,
    lng: 87.93,
  },
  schtarai: {
    name: 'Dhamma Tarai',
    centerId: 'dhamma-tarai',
    city: 'Birganj',
    region: 'Lumbini & Terai',
    altitude: 75,
    lat: 27.01,
    lng: 84.87,
  },
  schyana: {
    name: 'Dhamma Yana',
    centerId: 'dhamma-yana',
    city: 'Bhimdatta, Kanchanpur',
    region: 'Karnali & West Nepal',
    altitude: 175,
    lat: 28.97,
    lng: 80.57,
  },
};

const MONTH_MAP = {
  Jan: '01',
  Feb: '02',
  Mar: '03',
  Apr: '04',
  May: '05',
  Jun: '06',
  Jul: '07',
  Aug: '08',
  Sep: '09',
  Oct: '10',
  Nov: '11',
  Dec: '12',
};

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(raw) {
  const m = raw.match(/(\d{1,2})\s+([A-Za-z]+)/);
  if (!m) return { iso: '', display: raw.trim() };
  const day = m[1].padStart(2, '0');
  const monthNum = MONTH_MAP[m[2]] ?? '01';
  return { iso: `2026-${monthNum}-${day}`, display: `${m[2]} ${m[1]}` };
}

function parseDateRange(raw) {
  const clean = raw.replace(/\s+/g, ' ').trim();
  const parts = clean.split('-').map((s) => s.trim());
  if (parts.length === 2 && parts[0] && parts[1]) {
    const start = parseDate(parts[0]);
    const end = parseDate(parts[1]);
    const display = start.display && end.display ? `${start.display}–${end.display}, 2026` : clean;
    return { dates: display, startDate: start.iso, endDate: end.iso };
  }
  const single = parseDate(parts[0]);
  return { dates: `${single.display}, 2026`, startDate: single.iso, endDate: single.iso };
}

function parseCourseType(raw) {
  const t = raw.toLowerCase();
  if (t.includes('10-day') || t.includes('10 day')) return '10-Day';
  if (t.includes('20-day') || t.includes('20 day')) return '20-Day';
  if (t.includes('30-day') || t.includes('30 day')) return '30-Day';
  if (t.includes('45-day') || t.includes('45 day')) return '45-Day';
  if (t.includes('60-day') || t.includes('60 day')) return '60-Day';
  if (t.includes('3-day') || t.includes('3 day')) return '3-Day';
  if (t.includes('1-day') || t.includes('1 day')) return '1-Day';
  if (t.includes('satipatthana')) return 'Satipatthana Sutta';
  if (t.includes('teen') || t.includes('teenager')) return 'Teen Course';
  if (t.includes('children') || t.includes('anapana') || t.includes('child'))
    return "Children's Anapana";
  if (t.includes('executive')) return 'Executive';
  if (t.includes("teacher's self") || t.includes('teachers self')) return "Teacher's Self Course";
  return raw.trim();
}

function parseStatus(raw) {
  const t = raw.toLowerCase().trim();
  if (t === 'open') return 'open';
  if (t.includes('full')) return 'full';
  if (t.includes('in progress')) return 'in_progress';
  if (t.includes('waitlist') || t.includes('wait list')) return 'waitlist';
  if (t.includes('applications accepted starting')) return 'not_yet_open';
  if (t.includes('completed')) return 'completed';
  return 'closed';
}

function parseGender(comments) {
  const t = comments.toLowerCase();
  if (
    t.includes('male only') ||
    t.includes('men only') ||
    t.includes('for male') ||
    t.includes('for men')
  )
    return 'M';
  if (
    t.includes('female only') ||
    t.includes('women only') ||
    t.includes('for female') ||
    t.includes('for women')
  )
    return 'F';
  return 'Any';
}

function parseHtml(html, schId) {
  const center = NEPAL_CENTERS[schId];
  if (!center) return [];

  const courses = [];
  const rowRegex = /<tr[^>]+class="sch-row-\d+[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(tdMatch[1]));
    }
    if (cells.length < 4) continue;

    const rawDates = cells[1] ?? '';
    const rawType = cells[2] ?? '';
    const rawStatus = cells[3] ?? '';
    const rawComments = cells[5] ?? '';

    if (!rawDates || !rawType) continue;
    if (rawType.toLowerCase().includes('course type')) continue;

    const { dates, startDate, endDate } = parseDateRange(rawDates);
    const type = parseCourseType(rawType);
    const status = parseStatus(rawStatus);
    const gender = parseGender(rawComments);

    if (status === 'completed' || status === 'in_progress' || status === 'closed') continue;

    courses.push({
      schId,
      ...center,
      type,
      dates,
      startDate,
      endDate,
      status,
      genderRequired: gender,
      notes: rawComments,
      languages: ['ne', 'en'],
    });
  }
  return courses;
}

function fetchPage(schId) {
  return new Promise((resolve) => {
    const url = `https://www.dhamma.org/en/schedules/${schId}`;
    const opts = { headers: { 'User-Agent': 'DhammaATApp/1.0' } };
    https
      .get(url, opts, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', (err) => {
        console.error(`  ✗ ${schId}: ${err.message}`);
        resolve('');
      });
  });
}

async function run() {
  console.log('🔄 Scraping 19 Nepal Dhamma center schedules...\n');
  const allCourses = [];
  let id = 1;

  for (const schId of Object.keys(NEPAL_CENTERS)) {
    process.stdout.write(`  Fetching ${schId}... `);
    const html = await fetchPage(schId);
    const parsed = parseHtml(html, schId);

    const mapped = parsed.map((c) => ({
      id: id++,
      type: c.type,
      center: c.name,
      centerId: c.centerId,
      city: c.city,
      country: 'NP',
      flag: '🇳🇵',
      dates: c.dates,
      startDate: c.startDate,
      endDate: c.endDate,
      languages: c.languages,
      needCount: 1,
      genderRequired: c.genderRequired,
      status: c.status,
      notes: c.notes || undefined,
      distanceKm: 0,
      travelHrs: 0,
      altitude: c.altitude,
      students: { expected: 80, male: 40, female: 40 },
      arrivalDate: c.startDate
        ? (() => {
            const [, m, d] = c.startDate.split('-');
            const mn = [
              '',
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ];
            return `${mn[+m]} ${+d}`;
          })()
        : '',
      arrivalTime: '5:00 PM',
      coordinator: {
        name: 'Center Coordinator',
        role: 'Course Coordinator',
        phone: 'See dhamma.org',
      },
      transport: 'See dhamma.org for directions',
    }));

    console.log(`${parsed.length} courses`);
    allCourses.push(...mapped);

    // Polite delay between requests
    await new Promise((r) => setTimeout(r, 800));
  }

  const outPath = path.join(__dirname, '../src/data/courses.json');
  fs.writeFileSync(outPath, JSON.stringify(allCourses, null, 2));
  console.log(`\n✅ Written ${allCourses.length} courses to src/data/courses.json`);
}

run().catch(console.error);
