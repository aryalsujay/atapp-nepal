import { Status } from './common';

export type NotificationType =
  | 'invite'
  | 'assignment'
  | 'reminder'
  | 'update'
  | 'approval'
  | 'rejection'
  | 'new_application'
  | 'withdrawal_request';

export interface Notification {
  id: number;
  targetUserId: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  courseId?: number;
  /** The application this notification is about — populated for
   *  'new_application', 'withdrawal_request', 'approval', 'rejection',
   *  so taps can deep-link to the matching review / detail screen. */
  applicationId?: number;
  center: string;
  course: string;
  subjectEn: string;
  bodyEn: string;
  bodyNe: string;
  status?: Status;
  declineReason?: string;
}
