import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../src/store/authStore';
import { useProfileStore } from '../../../src/store/profileStore';
import { Colors, Gradients } from '../../../src/theme/colors';
import { FontSize, FontWeight } from '../../../src/theme/typography';
import { Radius, Layout, Spacing } from '../../../src/theme/spacing';
import { Shadows } from '../../../src/theme/shadows';
import { AvailabilityCalendar } from '../../../src/components/ui/AvailabilityCalendar';
import { Chip } from '../../../src/components/ui/Badge';
import { Button } from '../../../src/components/ui/Button';
import { LotusHero, MountainSilhouette } from '../../../src/components/ui/HeroDecorations';

const LANG_LEVELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId) ?? '';
  const signOut = useAuthStore((s) => s.signOut);
  const { profile, loadProfile } = useProfileStore();

  useEffect(() => {
    loadProfile(userId);
  }, [userId]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.cr }} />
    );
  }

  const activeLangs = Object.entries(profile.languages).filter(([, v]) => v !== 'off');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.cr }} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <LinearGradient
        colors={Gradients.teacher as unknown as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <LotusHero color="white" opacity={0.08} size={220} />
        <MountainSilhouette />

        {/* VRI Dharma Wheel — top right */}
        <Image
          source={require('../../../assets/vri-wheel.png')}
          style={styles.vriWheel}
          resizeMode="contain"
        />

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
          </View>
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.role}>{t('home.subtitle')} · {profile.region} {profile.flag ?? '🇳🇵'}</Text>
        <Text style={styles.authLine}>🔒 Authorized since {profile.authorizedSince}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox label={t('profile.totalCourses')} value={String(profile.totalCourses)} />
          <StatBox label={t('profile.centersServed')} value={String(profile.centersServed)} />
          <StatBox label={t('profile.thisYear')} value={String(profile.coursesThisYear)} />
          <StatBox label="Years" value={String(new Date().getFullYear() - Number(profile.authorizedSince))} />
        </View>

        {/* Edit button */}
        <TouchableOpacity
          onPress={() => router.push('/(teacher)/profile/edit')}
          style={styles.editBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.editBtnText}>{t('profile.edit')}</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Eligibility */}
      <View style={styles.section}>
        <View style={styles.eligibilityRow}>
          <View style={styles.eligibilityBadge}>
            <Text style={styles.eligibilityCheck}>✓</Text>
          </View>
          <View style={styles.eligibilityInfo}>
            <Text style={styles.sectionTitle}>{t('profile.eligible')}</Text>
            <Text style={styles.sectionSub}>
              {t('home.lastCourse')}: {profile.teachingHistory?.[0]?.date ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Languages */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.languages')}</Text>
        <View style={styles.langGrid}>
          {activeLangs.map(([lang, level]) => (
            <View key={lang} style={styles.langItem}>
              <Chip
                label={lang}
                variant={level === 'primary' ? 'orange' : 'gray'}
              />
              <Text style={styles.langLevel}>{LANG_LEVELS[level] ?? level}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Course authorizations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.authorizations')}</Text>
        <View style={styles.chipWrap}>
          {profile.authorizations.map((auth) => (
            <Chip key={auth} label={auth} variant="green" />
          ))}
        </View>
      </View>

      {/* Preferred regions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.regions')}</Text>
        {profile.preferredRegions.map((region, idx) => (
          <View key={region} style={styles.regionItem}>
            <Text style={styles.regionRank}>{idx + 1}</Text>
            <Text style={styles.regionName}>{region}</Text>
          </View>
        ))}
      </View>

      {/* Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.availability')}</Text>
        <AvailabilityCalendar availability={profile.monthlyAvailability} editable={false} />
      </View>

      {/* Teaching history */}
      {profile.teachingHistory?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.history')}</Text>
          {profile.teachingHistory.map((entry, idx) => (
            <View key={idx} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyDate}>{entry.date}</Text>
                <Text style={styles.historyCenter}>{entry.center} {entry.country}</Text>
              </View>
              <View style={styles.historyRight}>
                <Chip label={entry.type} variant="orange" />
                <Text style={styles.historyStudents}>{entry.students} students</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Personal note */}
      {profile.personalNote ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.note')}</Text>
          <Text style={styles.noteText}>{profile.personalNote}</Text>
        </View>
      ) : null}

      {/* Sign out */}
      <View style={{ paddingHorizontal: Layout.horizontalPad, paddingVertical: Spacing.xl }}>
        <Button
          label={t('common.signOut')}
          variant="outline"
          fullWidth
          onPress={handleSignOut}
        />
      </View>
    </ScrollView>
  );
}

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: Layout.horizontalPad,
    paddingBottom: Layout.heroPadBottom + 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  vriWheel: {
    position: 'absolute',
    right: -20,
    top: 30,
    width: 130,
    height: 130,
    opacity: 0.18,
  },
  avatarWrap: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  name: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.extrabold,
    color: Colors.white,
    marginBottom: 4,
  },
  role: {
    fontSize: FontSize.smPlus,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 3,
  },
  authLine: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.sm,
    padding: 8,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.medium,
    textAlign: 'center',
  },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  editBtnText: {
    color: Colors.white,
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.semibold,
  },

  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Layout.horizontalPad,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Layout.cardPad,
    borderWidth: 1,
    borderColor: Colors.bd,
    ...Shadows.card,
    gap: 10,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
  },
  sectionSub: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
  },

  eligibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  eligibilityBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.fol,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eligibilityCheck: {
    fontSize: 18,
    color: Colors.fo,
    fontWeight: FontWeight.bold,
  },
  eligibilityInfo: {
    flex: 1,
    gap: 2,
  },

  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  langItem: {
    alignItems: 'center',
    gap: 4,
  },
  langLevel: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
  },
  regionRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.sfl,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.sf,
  },
  regionName: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.medium,
  },

  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bd,
    gap: 8,
  },
  historyLeft: {
    flex: 1,
    gap: 2,
  },
  historyDate: {
    fontSize: FontSize.sm,
    color: Colors.tx3,
    fontWeight: FontWeight.medium,
  },
  historyCenter: {
    fontSize: FontSize.smPlus,
    color: Colors.tx,
    fontWeight: FontWeight.semibold,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  historyStudents: {
    fontSize: FontSize.xs,
    color: Colors.tx3,
  },

  noteText: {
    fontSize: FontSize.smPlus,
    color: Colors.tx2,
    lineHeight: FontSize.smPlus * 1.55,
  },
});
