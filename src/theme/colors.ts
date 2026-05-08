export const Colors = {
  // Teacher (Orange/Brown)
  sf: '#D4760E',
  sfd: '#A85C08',
  sfl: '#FDF1E3',
  sfm: '#FAE0C0',

  // Approved / Forest (Green)
  fo: '#3D6847',
  fol: '#E8F2EA',
  fom: '#C8DFCB',

  // Neutral / Surface (Beige/Cream)
  cr: '#F8F3EB',
  cr2: '#F0E9DC',
  cr3: '#E5DDD0',
  white: '#FFFFFF',

  // Text (Brown scale)
  tx: '#1C1410',
  tx2: '#7A6A58',
  tx3: '#AFA090',

  // Borders
  bd: '#EAE2D4',
  bd2: '#DDD4C5',

  // Error / Urgent (Red)
  ur: '#C0392B',
  url: '#FDECEA',

  // Gold (Festival / Pending)
  gd: '#C89000',
  gdl: '#FFF8E3',

  // Admin / Secondary (Blue)
  bl: '#1A5C96',
  bll: '#E6F0FA',

  // Server (Tan/Brown)
  sv: '#8B5E14',
  svd: '#6B4610',
  svl: '#FBF0E0',
  svm: '#F5DFB8',

  // Shadows (as RGBA strings)
  shadowCard: 'rgba(0,0,0,0.08)',
  shadowElevated: 'rgba(0,0,0,0.12)',
} as const;

export type ColorKey = keyof typeof Colors;

// Role gradient stops
export const Gradients = {
  teacher: ['#6B3600', '#C87010', '#E8A058'] as const,
  admin: ['#0F2A40', '#1A4A72', '#2A6096'] as const,
  approved: ['#2A4A30', '#3D6847'] as const,
  course: ['#2A4A30', '#3D6847'] as const,
  autoSchedule: ['#1C4228', '#3D6847'] as const,
  adminReview: ['#0F2438', '#1A5C96'] as const,
};

// Service area colors (8 areas)
export const ServiceAreaColors: Record<string, string> = {
  kitchen: '#E8744A',
  dining: '#D4A020',
  dhamma: '#7B5EA6',
  compound: '#4A7A58',
  reception: '#2A6496',
  at_assistant: '#8B4A00',
  manager: '#5A3A8A',
  residence: '#3A7A6A',
};

// Match score tier colors
export const MatchColors = {
  high: { bg: Colors.fol, text: Colors.fo },
  mid: { bg: Colors.bll, text: Colors.bl },
  low: { bg: Colors.cr2, text: Colors.tx3 },
};

// Status colors
export const StatusColors = {
  approved: { bg: Colors.fol, text: Colors.fo },
  pending: { bg: Colors.gdl, text: Colors.gd },
  rejected: { bg: Colors.url, text: Colors.ur },
};
