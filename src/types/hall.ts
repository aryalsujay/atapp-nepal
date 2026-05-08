import { Gender } from './common';

export interface Hall {
  id: string;
  centreId: string;
  name: string;
  teacherSlots: number;
  genderRequired: Gender | 'Any';
  notes?: string;
}
