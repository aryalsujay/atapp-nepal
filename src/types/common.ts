export type Language = 'en' | 'ne';
export type Role = 'teacher' | 'admin';
export type Gender = 'M' | 'F';
export type Status = 'pending' | 'approved' | 'rejected' | 'withdrawal_requested';
export type AvailabilityState = 0 | 1 | 'f'; // 0=unavailable, 1=available, f=festival

export type CourseType =
  | '10-Day'
  | '20-Day'
  | '30-Day'
  | '45-Day'
  | '60-Day'
  | '3-Day'
  | '1-Day'
  | 'Satipatthana Sutta'
  | "Children's Anapana"
  | 'Teen Course'
  | 'Executive'
  | "Teacher's Self Course";

export type LanguageLevel = 'primary' | 'secondary' | 'off';
