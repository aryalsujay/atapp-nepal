/**
 * Apply CTA section — three mutually exclusive states:
 * - assigned: "View Brief" button (forest fill)
 * - already-submitted: "Application submitted" confirmation box
 * - default: gradient Apply button + share note
 * Prototype-faithful port of `app.html:1152–1153` (and submitted state).
 */
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/theme/colors';
import { FontFamily } from '@/theme/typography';

interface Props {
  isAssigned: boolean;
  showSubmitted: boolean;
  submitting: boolean;
  onApply: () => void;
  onViewBrief: () => void;
  labels: {
    viewBrief: string;
    submittedTitle: string;
    submittedMessage: string;
    applyButton: string;
    submitting: string;
    shareNote: string;
  };
}

export const ApplyCta: React.FC<Props> = ({
  isAssigned,
  showSubmitted,
  submitting,
  onApply,
  onViewBrief,
  labels,
}) => {
  return (
    <View style={s.applySection}>
      {isAssigned ? (
        <TouchableOpacity activeOpacity={0.85} onPress={onViewBrief} style={s.viewBriefBtn}>
          <Text style={s.viewBriefText}>{labels.viewBrief}</Text>
        </TouchableOpacity>
      ) : showSubmitted ? (
        <View style={s.submittedBox}>
          <Text style={s.submittedEmoji}>✅</Text>
          <Text style={s.submittedTitle}>{labels.submittedTitle}</Text>
          <Text style={s.submittedMsg}>{labels.submittedMessage}</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            onPress={onApply}
            activeOpacity={0.85}
            disabled={submitting}
            style={s.applyBtnWrap}
          >
            <LinearGradient
              colors={[Colors.sf, Colors.sfd] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.applyBtn}
            >
              <Text style={s.applyBtnText}>
                {submitting ? labels.submitting : labels.applyButton}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={s.shareNote}>{labels.shareNote}</Text>
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  applySection: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  applyBtnWrap: {},
  applyBtn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
  shareNote: {
    marginTop: 8,
    fontSize: 11,
    color: Colors.tx3,
    fontFamily: FontFamily.sansRegular,
    textAlign: 'center',
  },
  submittedBox: {
    backgroundColor: Colors.fol,
    borderWidth: 1.5,
    borderColor: Colors.fom,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  submittedEmoji: {
    fontSize: 26,
    marginBottom: 6,
  },
  submittedTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
    color: Colors.fo,
  },
  submittedMsg: {
    fontSize: 12.5,
    color: Colors.tx2,
    fontFamily: FontFamily.sansRegular,
    marginTop: 4,
    textAlign: 'center',
  },
  viewBriefBtn: {
    backgroundColor: Colors.fo,
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBriefText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FontFamily.sansBold,
  },
});
