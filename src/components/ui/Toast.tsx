/**
 * Toast — replaces `Alert.alert` for fire-and-forget feedback.
 *
 * Mount `<ToastProvider>` once near the root (in `app/_layout.tsx`).
 * In any descendant, call `useToast()` to get `{ show, success, error, info }`.
 *
 * Confirm dialogs (multi-button modals) belong in `<ConfirmDialog>` (R2), not here.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastEntry {
  id: number;
  message: string;
  title?: string;
  variant: ToastVariant;
}

interface ToastAPI {
  show: (message: string, opts?: { title?: string; variant?: ToastVariant }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastAPI | null>(null);

const VARIANT_STYLE: Record<
  ToastVariant,
  { bg: string; border: string; text: string; emoji: string }
> = {
  success: { bg: Colors.fol, border: Colors.fom, text: Colors.fo, emoji: '✓' },
  error: { bg: Colors.url, border: Colors.urd, text: Colors.ur, emoji: '⚠' },
  warning: { bg: Colors.gdl, border: '#F0DCA3', text: Colors.gd, emoji: '⚠' },
  info: { bg: Colors.bll, border: Colors.bld, text: Colors.bl, emoji: 'ℹ' },
};

const TOAST_DURATION_MS = 3500;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idCounter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback<ToastAPI['show']>(
    (message, opts) => {
      const id = ++idCounter.current;
      const entry: ToastEntry = {
        id,
        message,
        title: opts?.title,
        variant: opts?.variant ?? 'info',
      };
      setToasts((prev) => [...prev, entry]);
      setTimeout(() => remove(id), TOAST_DURATION_MS);
    },
    [remove],
  );

  const api = useMemo<ToastAPI>(
    () => ({
      show,
      success: (m, t) => show(m, { title: t, variant: 'success' }),
      error: (m, t) => show(m, { title: t, variant: 'error' }),
      info: (m, t) => show(m, { title: t, variant: 'info' }),
      warning: (m, t) => show(m, { title: t, variant: 'warning' }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={remove} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastAPI {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be called inside <ToastProvider>');
  return ctx;
}

/** Renders the toast stack at the top of the screen, below the status bar. */
function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[];
  onDismiss: (id: number) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.viewport, { top: insets.top + Spacing.sm }]}>
      {toasts.map((t) => (
        <ToastItem key={t.id} entry={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </View>
  );
}

function ToastItem({ entry, onDismiss }: { entry: ToastEntry; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const v = VARIANT_STYLE[entry.variant];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}
      onTouchEnd={onDismiss}
    >
      <Text style={[styles.emoji, { color: v.text }]}>{v.emoji}</Text>
      <View style={styles.body}>
        {entry.title && <Text style={[styles.title, { color: v.text }]}>{entry.title}</Text>}
        <Text style={[styles.message, { color: v.text }]}>{entry.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  emoji: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.base * 1.3,
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  message: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
  },
});
