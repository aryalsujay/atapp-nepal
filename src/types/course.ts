import { CourseType, Gender } from './common';

export interface CoTeacher {
  name: string;
  gender: Gender;
  languages: string[];
  phone?: string;
}

export interface Coordinator {
  name: string;
  role: string;
  phone: string;
}

export interface Course {
  id: number;
  type: CourseType;
  center: string;
  centerId: string;
  city: string;
  country: string;
  flag?: string;
  dates: string;
  startDate: string;
  endDate: string;
  languages: string[];
  needCount: number;
  genderRequired: Gender | 'Any';
  coTeacher?: CoTeacher;
  distanceKm: number;
  travelHrs: number;
  altitude?: number;
  students: { expected: number; male: number; female: number };
  arrivalDate: string;
  arrivalTime: string;
  coordinator: Coordinator;
  transport: string;
  status?: string;
  notes?: string;
  match?: number;
}
