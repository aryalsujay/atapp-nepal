/**
 * Outlined "Sign Out" CTA pinned to the end of the Teacher Profile screen.
 *
 * The confirm dialog is owned by the parent so it can route to the login
 * screen on success — this component is purely the styled button.
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';

export function SignOutButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={s.wrap}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.btn}>
        <Text style={s.text}>{t('common.signOut')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
  },
  btn: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F5C0BB',
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.ur,
  },
});
