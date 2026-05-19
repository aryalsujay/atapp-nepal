/**
 * Tiny relative-time formatter — keeps "Last synced …" subtitles human.
 * No dep on Intl.RelativeTimeFormat since RN/Hermes still ships partial
 * locale data on Android. EN + NE only for now.
 */

export type Lang = 'en' | 'ne';

const LABELS: Record<Lang, Record<'just_now' | 'min' | 'h' | 'd' | 'yesterday' | 'ago', string>> = {
  en: {
    just_now: 'Just now',
    min: 'min',
    h: 'h',
    d: 'd',
    yesterday: 'Yesterday',
    ago: 'ago',
  },
  ne: {
    just_now: 'भर्खरै',
    min: 'मिनेट',
    h: 'घण्टा',
    d: 'दिन',
    yesterday: 'हिजो',
    ago: 'पहिले',
  },
};

export function relativeTime(date: Date | string | null | undefined, lang: Lang = 'en'): string {
  if (!date) return '';
  const t = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  if (Number.isNaN(t)) return '';
  const deltaMs = Date.now() - t;
  const labels = LABELS[lang];

  if (deltaMs < 60_000) return labels.just_now;

  const mins = Math.round(deltaMs / 60_000);
  if (mins < 60) return `${mins} ${labels.min} ${labels.ago}`;

  const hours = Math.round(deltaMs / 3_600_000);
  if (hours < 24) return `${hours} ${labels.h} ${labels.ago}`;

  const days = Math.round(deltaMs / 86_400_000);
  if (days === 1) return labels.yesterday;
  return `${days} ${labels.d} ${labels.ago}`;
}
