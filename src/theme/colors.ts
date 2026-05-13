/**
 * Design tokens — colors & gradients.
 *
 * Single source of truth. Mirrors the CSS variables defined in the prototype at
 * `VipassanaTeacherApp/app.html` lines 447–457. Any change here must be
 * reflected in `specs/_design-tokens.md` and vice versa.
 */

export const Colors = {
  // Teacher / Saffron — prototype `--sf*`
  sf: '#D4760E',
  sfd: '#A85C08',
  sfl: '#FDF1E3',
  sfm: '#FAE0C0',

  // Approved / Forest Green — prototype `--fo*`
  fo: '#3D6847',
  fol: '#E8F2EA',
  fom: '#C8DFCB',

  // Neutral / Surface — prototype `--cr*` and `--card`
  cr: '#F8F3EB',
  cr2: '#F0E9DC',
  cr3: '#E5DDD0',
  white: '#FFFFFF',

  // Text — prototype `--tx*`
  tx: '#1C1410',
  tx2: '#7A6A58',
  tx3: '#B0A090',

  // Borders — prototype `--bd*`
  bd: '#EAE2D4',
  bd2: '#DDD4C5',

  // Error / Urgent — prototype `--ur*`
  ur: '#C0392B',
  url: '#FDECEA',
  urd: '#F5C0BB', // urgent border (prototype `.btn.dg` uses `1.5px solid #F5C0BB`)

  // Gold / Pending — prototype `--gd*`
  gd: '#C89000',
  gdl: '#FFF8E3',
  gdd: '#7A6000', // gold dark text (prototype inline)

  // Admin / Blue — prototype `--bl*`
  bl: '#1A5C96',
  bll: '#E6F0FA',
  bld: '#BDD4EE', // blue border (prototype invite-only notice)
  bl2: '#5B6FA8', // step-down button accent (prototype inline)

  // Server / Earthy Tan — prototype `--sv*` and `--svfo`
  sv: '#8B5E14',
  svd: '#6B4610',
  svl: '#FBF0E0',
  svm: '#F5DFB8',
  svfo: '#4A7A58', // server forest accent — was missing

  // Forest CTA stop — prototype `.btn.fo-btn` uses `#2d5236`
  foDark: '#2D5236',

  // Shadow base color — prototype `--sh` / `--shl` use rgba(28,20,8,…)
  shadowBase: '#1C1408',
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * Role gradients — all use 160° linear-gradient in the prototype.
 * The direction is enforced at the call site via `start={{x:0,y:0}} end={{x:1,y:1.176}}`
 * which approximates 160° in RN's `LinearGradient` coordinate space.
 *
 * 160° in CSS = (sin(160°), -cos(160°)) ≈ (0.342, 0.940)
 * In RN LinearGradient: end={{ x: 0.5 + sin(θ)/2, y: 0.5 - cos(θ)/2 }}
 * For 160°: end ≈ { x: 0.671, y: 0.970 }
 */
export const GradientDirection = {
  // Hero gradient direction — 160° (top-left-ish → bottom-right)
  hero: { start: { x: 0, y: 0 }, end: { x: 0.671, y: 0.97 } } as const,
  // Button gradient direction — 135° (top-left → bottom-right)
  button: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } as const,
};

export const Gradients = {
  // Login + role-themed heroes — 160°, 3 stops
  teacher: ['#6B3600', '#C87010', '#E8A058'] as const,
  server: ['#5A3800', '#9B6B14', '#D4A050'] as const,
  admin: ['#0F2A40', '#1A4A72', '#2A6096'] as const,

  // Confirmation / approved screens — 160°, 2 stops
  approved: ['#2A4A30', '#3D6847'] as const,
  course: ['#2A4A30', '#3D6847'] as const,

  // Admin sub-section heros — 160°, 2 stops
  autoSchedule: ['#1C4228', '#3D6847'] as const,
  adminReview: ['#0F2438', '#1A5C96'] as const,

  // Button gradients — 135°, 2 stops (prototype `.btn.pr` and `.btn.fo-btn`)
  primaryCta: ['#D4760E', '#A85C08'] as const, // sf → sfd
  forestCta: ['#3D6847', '#2D5236'] as const, // fo → foDark
};

/**
 * Service area colors — used in server flows.
 * Not derived from prototype CSS vars; defined for our 8 service areas.
 */
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

/** Match-score tier colors — prototype `.mbadge.hi/.md/.lo` */
export const MatchColors = {
  high: { bg: Colors.fol, text: Colors.fo },
  mid: { bg: Colors.bll, text: Colors.bl },
  low: { bg: Colors.cr2, text: Colors.tx3 },
};

/** Status pill colors — prototype `.spill.appr/.pend/.reje` */
export const StatusColors = {
  approved: { bg: Colors.fol, text: Colors.fo },
  pending: { bg: Colors.gdl, text: Colors.gd },
  rejected: { bg: Colors.url, text: Colors.ur },
};
