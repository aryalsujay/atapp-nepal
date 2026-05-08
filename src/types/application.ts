import { Status } from './common';

export interface Application {
  id: number;
  courseId: number;
  teacherId: string;
  status: Status;
  appliedDate: string;
  source: 'applied' | 'assigned';
  rejectionReason?: string;
  queuePosition?: number;
  withdrawalNote?: string;
}
