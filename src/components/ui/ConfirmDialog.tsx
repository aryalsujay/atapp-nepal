/**
 * ConfirmDialog — replaces `Alert.alert(...)` with button arrays.
 *
 * Mount `<ConfirmDialogProvider>` once near the root.
 * Then in any descendant: `const confirm = useConfirm()`.
 *
 * Usage:
 *   confirm({
 *     title: 'Sign Out',
 *     message: 'Are you sure?',
 *     destructive: true,
 *     confirmText: 'Sign Out',
 *     onConfirm: () => signOut(),
 *   });
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/theme/colors';
import { FontSize, FontWeight } from '@/theme/typography';
import { Radius, Spacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { Opacity } from '@/theme/opacity';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  /** When true the confirm button uses urgent / red styling. */
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmAPI {
  confirm: (opts: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmAPI | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => {
    setOpts(null);
    setBusy(false);
  }, []);

  const handleConfirm = async () => {
    if (!opts) return;
    setBusy(true);
    try {
      await opts.onConfirm();
    } finally {
      close();
    }
  };

  const handleCancel = () => {
    opts?.onCancel?.();
    close();
  };

  const api = useMemo<ConfirmAPI>(
    () => ({
      confirm: (next) => setOpts(next),
    }),
    [],
  );

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      <Modal
        visible={!!opts}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
        statusBarTranslucent
      >
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            {opts && (
              <>
                <Text style={styles.title}>{opts.title}</Text>
                {opts.message && <Text style={styles.message}>{opts.message}</Text>}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={[styles.button, styles.cancelButton]}
                    activeOpacity={Opacity.pressTouch}
                  >
                    <Text style={styles.cancelText}>{opts.cancelText ?? 'Cancel'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={busy}
                    style={[
                      styles.button,
                      opts.destructive ? styles.destructiveButton : styles.confirmButton,
                      busy && styles.busyButton,
                    ]}
                    activeOpacity={Opacity.pressTouch}
                  >
                    <Text
                      style={[
                        styles.confirmTextBase,
                        opts.destructive ? styles.destructiveText : styles.confirmText,
                      ]}
                    >
                      {opts.confirmText ?? 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (opts: ConfirmOptions) => void {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be called inside <ConfirmDialogProvider>');
  return ctx.confirm;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,20,8,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  dialog: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
    ...Shadows.modal,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.5,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.cr2,
  },
  confirmButton: {
    backgroundColor: Colors.bl,
  },
  destructiveButton: {
    backgroundColor: Colors.ur,
  },
  busyButton: {
    opacity: Opacity.disabled,
  },
  cancelText: {
    color: Colors.tx2,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  confirmTextBase: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  confirmText: {
    color: Colors.white,
  },
  destructiveText: {
    color: Colors.white,
  },
});
