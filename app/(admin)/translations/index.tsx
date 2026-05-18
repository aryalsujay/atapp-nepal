/**
 * Admin Translations — overview screen.
 * Implements `specs/31-admin-translations.md` §3.1.
 *
 * Four tiles: Export to Excel · Import from Excel · Review suggestions ·
 * Export current JSON. Reads suggestion count + key count via the store
 * and the bundled JSON respectively.
 */

import React, { useEffect, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Routes } from '@/routes';
import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';
import { Shadows } from '@/theme/shadows';
import { useToast } from '@/components/ui/Toast';
import { useTranslationsStore } from '@/store/translationsStore';
import { exportXlsx, exportJsonBundle, flatten } from '@/utils/i18nExport';
import { getDb } from '@/db';
import enJson from '@/translations/en.json';

export default function AdminTranslations() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const suggestions = useTranslationsStore((s) => s.suggestions);
  const loadSuggestions = useTranslationsStore((s) => s.loadSuggestions);

  useEffect(() => {
    loadSuggestions();
  }, [loadSuggestions]);

  const keyCount = useMemo(
    () => Object.keys(flatten(enJson as Record<string, unknown>)).length,
    [],
  );
  const pendingCount = suggestions.length;

  const handleExportXlsx = async () => {
    try {
      const { fileName } = await exportXlsx(getDb());
      toast.success(t('admin.translations.export_success', { file: fileName }));
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleExportJson = async () => {
    try {
      const files = await exportJsonBundle(getDb());
      toast.success(t('admin.translations.export_success', { file: files[0] ?? 'JSON' }));
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <View style={[s.flex, { backgroundColor: Colors.cr }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={[s.header, { paddingTop: Math.max(56, insets.top + 14) }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={s.back}>‹ {t('admin.translations.back')}</Text>
        </TouchableOpacity>
        <Text style={s.title}>🌐 {t('admin.translations.title')}</Text>
        <Text style={s.subtitle}>{t('admin.translations.subtitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <Tile
          emoji="📤"
          title={t('admin.translations.tile_export_xlsx')}
          subtitle={t('admin.translations.tile_export_xlsx_sub', { n: keyCount })}
          onPress={handleExportXlsx}
        />
        <Tile
          emoji="📥"
          title={t('admin.translations.tile_import')}
          subtitle={t('admin.translations.tile_import_sub')}
          onPress={() => router.push(Routes.adminTranslationsImport)}
        />
        <Tile
          emoji="📝"
          title={`${t('admin.translations.tile_review')} (${pendingCount})`}
          subtitle={t('admin.translations.tile_review_sub', { n: pendingCount })}
          onPress={() => router.push(Routes.adminTranslationsReview)}
          dimmed={pendingCount === 0}
        />
        <Tile
          emoji="💾"
          title={t('admin.translations.tile_export_json')}
          subtitle={t('admin.translations.tile_export_json_sub')}
          onPress={handleExportJson}
        />
      </ScrollView>
    </View>
  );
}

function Tile({
  emoji,
  title,
  subtitle,
  onPress,
  dimmed = false,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  dimmed?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[s.tile, dimmed && { opacity: 0.55 }]}
    >
      <Text style={s.tileEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.tileTitle}>{title}</Text>
        <Text style={s.tileSub}>{subtitle}</Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
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
    fontSize: 26,
    fontWeight: '800',
    fontFamily: FontFamily.sansExtraBold,
    color: Colors.tx,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },
  tile: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 18,
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Shadows.card,
  },
  tileEmoji: { fontSize: 22 },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.tx,
  },
  tileSub: {
    fontSize: 12,
    fontFamily: FontFamily.sansRegular,
    color: Colors.tx2,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: Colors.tx3,
  },
});
