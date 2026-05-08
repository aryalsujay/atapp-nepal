import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from '../types';

interface NotificationsState {
  notifications: Notification[];
  loaded: boolean;
  loadNotifications: () => Promise<void>;
  getForUser: (userId: string) => Notification[];
  addNotification: (partial: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Promise<Notification>;
  markRead: (id: number) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  respondToInvite: (id: number, response: 'accepted' | 'declined', reason?: string) => Promise<void>;
  getUnreadCount: (userId: string) => number;
}

const NOTIFS_KEY = '@dhamma_notifications';

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    targetUserId: 'teacher-001',
    type: 'assignment',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    courseId: 1,
    center: 'Dhamma Shringa',
    course: 'Dhamma Shringa — May 10-Day',
    subjectEn: 'You have been assigned to teach',
    bodyEn:
      'Dear Teacher,\n\nWith great joy we confirm your assignment to teach the 10-Day course at Dhamma Shringa from May 12–23, 2026.\n\nPlease arrive by May 11, 5:00 PM.\n\nSadhu! 🙏',
    bodyNe:
      'प्रिय शिक्षक,\n\nधम्म श्रृंगमा मे १२–२३, २०२६ को १०-दिन पाठ्यक्रममा शिक्षणको लागि तपाईंको नियुक्ति पुष्टि गर्दा हामी हर्षित छौं।\n\nमे ११ को साँझ ५:०० बजेसम्म आइपुग्नुहोस्।',
    status: 'approved',
  },
  {
    id: 2,
    targetUserId: 'teacher-001',
    type: 'invite',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    courseId: 3,
    center: 'Dhamma Pokhara',
    course: 'Dhamma Pokhara — Jul 10-Day',
    subjectEn: 'Invitation to teach — Dhamma Pokhara',
    bodyEn:
      'Dear Teacher,\n\nWe would like to invite you to teach the 10-Day course at Dhamma Pokhara from Jul 7–18, 2026.\n\nPlease accept or decline at your earliest convenience.\n\nIn Dhamma,\nDhamma Pokhara Management',
    bodyNe:
      'प्रिय शिक्षक,\n\nजुलाई ७–१८, २०२६ को पाठ्यक्रममा पढाउनका लागि तपाईंलाई आमन्त्रण गर्न चाहन्छौं।',
    status: 'pending',
  },
  {
    id: 3,
    targetUserId: 'teacher-001',
    type: 'rejection',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    courseId: 5,
    center: 'Dhamma Adhara',
    course: 'Dhamma Adhara — Sep 20-Day',
    subjectEn: 'Application update — Dhamma Adhara',
    bodyEn:
      'Dear Teacher,\n\nThank you for applying to the 20-Day course at Dhamma Adhara. Unfortunately another AT was confirmed before your application could be reviewed.\n\nWe hope to have you join us soon.\n\nIn Dhamma,\nScheduling Team',
    bodyNe:
      'प्रिय शिक्षक,\n\nआवेदनका लागि धन्यवाद। दुर्भाग्यवश तपाईंको आवेदन समीक्षा हुनु अघि नै अर्को AT पुष्टि भइसकेको थियो।',
  },
  {
    id: 4,
    targetUserId: 'teacher-001',
    type: 'reminder',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    center: 'Dhamma Shringa',
    course: 'All Nepal ATs',
    subjectEn: 'Open course — AT needed urgently',
    bodyEn:
      'Dear Teachers,\n\nDhamma Shringa has an open 10-Day course (Aug 15–26) still needing a Nepali-speaking AT.\n\nPlease apply via the Dhamma AT app.\n\nSadhu 🙏',
    bodyNe:
      'प्रिय शिक्षकहरू,\n\nधम्म श्रृंगमा अगस्ट १५–२६ को खुला पाठ्यक्रमलाई नेपाली भाषी सहायक शिक्षक चाहिन्छ।',
  },
  {
    id: 5,
    targetUserId: 'server-001',
    type: 'approval',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    center: 'Dhamma Shringa',
    course: 'Dhamma Shringa — Jul 10-Day',
    subjectEn: 'Service application approved!',
    bodyEn:
      'Dear Priya,\n\nWe are pleased to confirm your service at Dhamma Shringa from Jul 7–18, 2026 in the Kitchen and Dining Hall areas.\n\nPlease arrive by Jul 6, 7:00 AM. We look forward to serving together. Sadhu! 🙏',
    bodyNe:
      'प्रिय प्रिया,\n\nधम्म श्रृंगमा जुलाई ७–१८, २०२६ को पाठ्यक्रममा भान्सा र भोजन कक्षमा तपाईंको सेवाको पुष्टि गर्दा हामी हर्षित छौं। जुलाई ६, बिहान ७ बजेसम्म आइपुग्नु होस्।',
    status: 'approved',
  },
  {
    id: 6,
    targetUserId: 'server-001',
    type: 'reminder',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: false,
    center: 'Dhamma Pokhara',
    course: 'Dhamma Pokhara — Jul 15-Day',
    subjectEn: 'Pending application — review in progress',
    bodyEn:
      'Dear Priya,\n\nYour application for the Dhamma Hall at Dhamma Pokhara (Jul 15–26) is under review by the course coordinator. You will be notified within 3–5 days.',
    bodyNe:
      'प्रिय प्रिया,\n\nधम्म पोखराको ध्यान कक्षमा तपाईंको आवेदन समीक्षाधीन छ। ३–५ दिनभित्र सूचित गरिनेछ।',
  },
  {
    id: 7,
    targetUserId: 'server-001',
    type: 'rejection',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    center: 'Dhamma Adhara',
    course: 'Dhamma Adhara — Aug 10-Day',
    subjectEn: 'Application update — Dhamma Adhara',
    bodyEn:
      'Dear Priya,\n\nThank you for applying to serve at Dhamma Adhara (Aug 2–13). Unfortunately the compound area is fully booked for this course. We hope to serve with you at a future course.',
    bodyNe:
      'प्रिय प्रिया,\n\nधम्म अधाराको परिसर क्षेत्रमा आवेदनका लागि धन्यवाद। दुर्भाग्यवश यस पाठ्यक्रमको लागि परिसर क्षेत्र पूर्ण भरिसकेको छ।',
  },
];

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatNotifTime(iso: string): string {
  return relativeTime(iso);
}

async function loadFromStorage(): Promise<Notification[]> {
  const raw = await AsyncStorage.getItem(NOTIFS_KEY);
  if (raw) return JSON.parse(raw);
  await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(SEED_NOTIFICATIONS));
  return SEED_NOTIFICATIONS;
}

async function saveAll(notifs: Notification[]) {
  await AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs));
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loaded: false,

  loadNotifications: async () => {
    try {
      const all = await loadFromStorage();
      set({ notifications: all, loaded: true });
    } catch {
      set({ notifications: SEED_NOTIFICATIONS, loaded: true });
    }
  },

  getForUser: (userId) =>
    get().notifications.filter((n) => n.targetUserId === userId),

  addNotification: async (partial) => {
    const all = get().notifications;
    const newNotif: Notification = {
      ...partial,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...all];
    await saveAll(updated);
    set({ notifications: updated });
    return newNotif;
  },

  markRead: async (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    await saveAll(updated);
    set({ notifications: updated });
  },

  markAllRead: async (userId) => {
    const updated = get().notifications.map((n) =>
      n.targetUserId === userId ? { ...n, read: true } : n
    );
    await saveAll(updated);
    set({ notifications: updated });
  },

  respondToInvite: async (id, response, reason) => {
    const updated = get().notifications.map((n) =>
      n.id === id
        ? { ...n, status: response === 'accepted' ? ('approved' as const) : ('rejected' as const), declineReason: reason, read: true }
        : n
    );
    await saveAll(updated);
    set({ notifications: updated });
  },

  getUnreadCount: (userId) =>
    get().notifications.filter((n) => n.targetUserId === userId && !n.read).length,
}));
