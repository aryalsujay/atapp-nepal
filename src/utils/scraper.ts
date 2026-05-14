// Shared HTML parser for dhamma.org schedule pages.
// Works in both Node.js (scripts/) and React Native/Hermes (in-app sync).

export interface ScrapedCourse {
  schId: string;
  centerName: string;
  centerId: string;
  city: string;
  region: string;
  altitude: number;
  lat: number;
  lng: number;
  type: string;
  dates: string;
  startDate: string;
  endDate: string;
  status: string;
  genderRequired: 'M' | 'F' | 'Any';
  notes: string;
  languages: string[];
}

export interface CenterMeta {
  name: string;
  centerId: string;
  city: string;
  region: string;
  altitude: number;
  lat: number;
  lng: number;
}

export const NEPAL_CENTERS: Record<string, CenterMeta> = {
  schshringa: {
    name: 'Dharma Shringa',
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

const MONTH_MAP: Record<string, string> = {
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

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseDate(raw: string, year = 2026): { iso: string; display: string } {
  // raw: "27 May" or "12 May"
  const m = raw.match(/(\d{1,2})\s+([A-Za-z]+)/);
  if (!m) return { iso: '', display: raw.trim() };
  const day = m[1].padStart(2, '0');
  const monthNum = MONTH_MAP[m[2]] ?? '01';
  return { iso: `${year}-${monthNum}-${day}`, display: `${m[2]} ${m[1]}` };
}

function parseDateRange(raw: string): { dates: string; startDate: string; endDate: string } {
  // raw: "04 May  - 12 May" or "29 May" (single day)
  const clean = raw.replace(/\s+/g, ' ').trim();
  const parts = clean.split('-').map((s) => s.trim());
  if (parts.length === 2) {
    const start = parseDate(parts[0]);
    const end = parseDate(parts[1]);
    // Build display like "May 4–12, 2026"
    const display = start.display && end.display ? `${start.display}–${end.display}, 2026` : clean;
    return { dates: display, startDate: start.iso, endDate: end.iso };
  }
  const single = parseDate(parts[0]);
  return { dates: `${single.display}, 2026`, startDate: single.iso, endDate: single.iso };
}

function parseCourseType(raw: string): string {
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

function parseStatus(raw: string): string {
  const t = raw.toLowerCase().trim();
  if (t === 'open') return 'open';
  if (t.includes('full')) return 'full';
  if (t.includes('in progress') || t === 'in-progress') return 'in_progress';
  if (t.includes('waitlist') || t.includes('wait list')) return 'waitlist';
  if (t.includes('applications accepted starting')) return 'not_yet_open';
  if (t.includes('completed')) return 'completed';
  if (t === '' || t.includes('closed')) return 'closed';
  return t;
}

function parseGender(comments: string): 'M' | 'F' | 'Any' {
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

export function parseSchedulePage(html: string, schId: string): ScrapedCourse[] {
  const center = NEPAL_CENTERS[schId];
  if (!center) return [];

  const courses: ScrapedCourse[] = [];

  // Extract all <tr class="sch-row-..."> blocks
  const rowRegex = /<tr[^>]+class="sch-row-\d+[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1];

    // Extract <td> cells
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(stripTags(tdMatch[1]));
    }

    if (cells.length < 4) continue;

    // Columns: [apply, dates, type, status, location?, comments?]
    const rawDates = cells[1] ?? '';
    const rawType = cells[2] ?? '';
    const rawStatus = cells[3] ?? '';
    const rawComments = cells[5] ?? '';

    if (!rawDates || !rawType) continue;

    // Skip header rows
    if (rawType.toLowerCase().includes('course type')) continue;

    const { dates, startDate, endDate } = parseDateRange(rawDates);
    const type = parseCourseType(rawType);
    const status = parseStatus(rawStatus);
    const genderRequired = parseGender(rawComments);

    // Skip completed/in-progress for AT scheduling purposes
    if (status === 'completed' || status === 'in_progress' || status === 'closed') continue;

    courses.push({
      schId,
      centerName: center.name,
      centerId: center.centerId,
      city: center.city,
      region: center.region,
      altitude: center.altitude,
      lat: center.lat,
      lng: center.lng,
      type,
      dates,
      startDate,
      endDate,
      status,
      genderRequired,
      notes: rawComments,
      languages: ['ne', 'en'],
    });
  }

  return courses;
}
