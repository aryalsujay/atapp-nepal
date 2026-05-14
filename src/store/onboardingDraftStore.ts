/**
 * Onboarding wizard draft state — ephemeral, lives only for the duration
 * of the teacher onboarding flow. Persists across the per-step route
 * remounts (`/onboarding/teacher/[step]`).
 *
 * Cleared on completion (step-5 CTA) or explicit reset.
 */

import { create } from 'zustand';

export type LangLevel = 'primary' | 'secondary' | 'off';
export type AvCell = 0 | 1 | 'f';

const DEFAULT_LANGS: Record<string, LangLevel> = {
  Nepali: 'primary',
  English: 'primary',
  Hindi: 'secondary',
  Gujarati: 'off',
  German: 'off',
};

const DEFAULT_REGIONS: string[] = ['Kathmandu Valley'];

const DEFAULT_AV: AvCell[] = [1, 1, 1, 1, 'f', 0, 1, 1, 1, 'f', 'f', 0];

interface OnboardingDraftState {
  langs: Record<string, LangLevel>;
  regions: string[];
  av: AvCell[];
  note: string;
  cycleLang: (key: string) => void;
  toggleRegion: (name: string) => void;
  cycleMonth: (idx: number) => void;
  setNote: (note: string) => void;
  reset: () => void;
}

const LANG_CYCLE: Record<LangLevel, LangLevel> = {
  primary: 'secondary',
  secondary: 'off',
  off: 'primary',
};

const AV_CYCLE = (v: AvCell): AvCell => (v === 1 ? 'f' : v === 'f' ? 0 : 1);

export const useOnboardingDraftStore = create<OnboardingDraftState>((set) => ({
  langs: { ...DEFAULT_LANGS },
  regions: [...DEFAULT_REGIONS],
  av: [...DEFAULT_AV],
  note: '',

  cycleLang: (key) =>
    set((s) => ({
      langs: { ...s.langs, [key]: LANG_CYCLE[s.langs[key] ?? 'off'] },
    })),

  toggleRegion: (name) =>
    set((s) => ({
      regions: s.regions.includes(name)
        ? s.regions.filter((r) => r !== name)
        : [...s.regions, name],
    })),

  cycleMonth: (idx) =>
    set((s) => {
      const next = [...s.av];
      next[idx] = AV_CYCLE(next[idx]);
      return { av: next };
    }),

  setNote: (note) => set({ note }),

  reset: () =>
    set({
      langs: { ...DEFAULT_LANGS },
      regions: [...DEFAULT_REGIONS],
      av: [...DEFAULT_AV],
      note: '',
    }),
}));
