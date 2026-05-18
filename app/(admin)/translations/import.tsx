/**
 * Admin Translations — Import screen (spec 31 §3.2).
 *
 * Two phases: pick .xlsx → preview diff against live + suggestions.
 * Confirm writes each non-error row into translation_suggestions.
 */

import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Colors, Gradients, GradientDirection } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { useTranslationsStore } from '@/store/translationsStore';
import { parseXlsx, type ImportPreview, type PreviewSuggestion } from '@/utils/i18nImport';
import { getDb } from '@/db';
import { logger } from '@/utils/logger';

export default function AdminTranslationsImport() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const adminId = useAuthStore((s) => s.userId);
  const upsertSuggestions = useTranslationsStore((s) => s.upsertSuggestions);

  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [busy, setBusy] = useState(false);

  const pickFile = async () => {
    try {
      setBusy(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          '*/*',
        ],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const b64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buf = base64ToUint8Array(b64);
      const p = parseXlsx(buf, getDb());
      setPreview(p);
    } catch (err) {
      logger.warn('[translations import] pick failed', err);
      toast.error(String(err));
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!preview) return;
    const n = upsertSuggestions(
      preview.suggestions.map(({ key, lang, value, note }) => ({ key, lang, value, note })),
      adminId,
    );
    toast.success(t('admin.translations.import_success', { n }));
    router.back();
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>‹ {t('admin.translations.back')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{t('admin.translations.import_title')}</Text>
      </View>

      {!preview ? (
        <View style={s.pickWrap}>
          <TouchableOpacity onPress={pickFile} activeOpacity={0.85} disabled={busy}>
            <LinearGradient
              colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
              start={GradientDirection.button.start}
              end={GradientDirection.button.end}
              style={s.primaryBtn}
            >
              <Text style={s.primaryBtnText}>{t('admin.translations.choose_file')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <PreviewView
          preview={preview}
          onCancel={() => setPreview(null)}
          onConfirm={confirm}
          insetsBottom={insets.bottom}
          tFn={t}
        />
      )}
    </View>
  );
}

function PreviewView({
  preview,
  onCancel,
  onConfirm,
  insetsBottom,
  tFn,
}: {
  preview: ImportPreview;
  onCancel: () => void;
  onConfirm: () => void;
  insetsBottom: number;
  tFn: (k: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <View style={s.flex}>
      {!preview.ok ? (
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <View style={s.errorBanner}>
            <Text style={s.errorText}>
              {tFn('admin.translations.err_missing_columns', {
                cols: preview.missingColumns.join(', '),
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancel} style={s.outlineBtn} activeOpacity={0.85}>
            <Text style={s.outlineBtnText}>{tFn('admin.translations.cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <View style={s.summaryRow}>
            <Text style={s.summaryText}>
              {tFn('admin.translations.preview_counts', {
                a: preview.added,
                c: preview.changed,
                e: preview.errors,
              })}
            </Text>
          </View>
          {preview.unknownKeys.length > 0 && (
            <View style={s.errorBanner}>
              <Text style={s.errorText}>
                {tFn('admin.translations.err_unknown_keys', { n: preview.unknownKeys.length })}
              </Text>
            </View>
          )}
          <FlatList
            data={preview.suggestions}
            keyExtractor={(item, i) => `${item.key}__${item.lang}__${i}`}
            renderItem={({ item }) => <PreviewRow item={item} />}
            ListEmptyComponent={
              <View style={{ padding: 18 }}>
                <Text style={s.emptyText}>—</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: insetsBottom + 96 }}
          />
          <View style={[s.bottomBar, { paddingBottom: insetsBottom + 12 }]}>
            <TouchableOpacity onPress={onCancel} style={s.outlineBtn} activeOpacity={0.85}>
              <Text style={s.outlineBtnText}>{tFn('admin.translations.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} activeOpacity={0.85} style={{ flex: 1 }}>
              <LinearGradient
                colors={Gradients.primaryCta as unknown as [string, string, ...string[]]}
                start={GradientDirection.button.start}
                end={GradientDirection.button.end}
                style={s.primaryBtn}
              >
                <Text style={s.primaryBtnText}>
                  {tFn('admin.translations.confirm_import')} ({preview.suggestions.length})
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function PreviewRow({ item }: { item: PreviewSuggestion }) {
  return (
    <View style={s.row}>
      <Text style={s.rowKey} numberOfLines={1}>
        [{item.lang.toUpperCase()}] {item.key}
      </Text>
      <Text style={s.rowLive} numberOfLines={2}>
        {item.liveValue || '—'}
      </Text>
      <Text style={s.rowArrow}>→</Text>
      <Text style={s.rowSug} numberOfLines={2}>
        {item.value}
      </Text>
    </View>
  );
}

function base64ToUint8Array(b64: string): Uint8Array {
  // Decode base64 → bytes. Atob is available in modern RN runtimes via Hermes/JSC polyfill.
  const binary = globalThis.atob(b64);
  const len = binary.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  back: {
    fontSize: 13,
    color: Colors.sf,
    fontWeight: '600',
    fontFamily: FontFamily.sansSemiBold,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
  },
  pickWrap: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  primaryBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  outlineBtn: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.bd2,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: Colors.tx2,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  summaryRow: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  summaryText: {
    fontSize: 12.5,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    color: Colors.tx2,
  },
  errorBanner: {
    backgroundColor: Colors.url,
    margin: 18,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 12.5,
    color: Colors.ur,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.tx3,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 18,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
    ...Shadows.card,
  },
  rowKey: {
    fontSize: 10,
    color: Colors.tx3,
    fontFamily: FontFamily.sansSemiBold,
    fontWeight: '600',
    width: 110,
  },
  rowLive: {
    flex: 1,
    fontSize: 11,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
  },
  rowArrow: {
    fontSize: 14,
    color: Colors.tx3,
    fontWeight: '700',
  },
  rowSug: {
    flex: 1,
    fontSize: 11.5,
    color: Colors.tx,
    fontFamily: FontFamily.sansBold,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.bd,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
});
