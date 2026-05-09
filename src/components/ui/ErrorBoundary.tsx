import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontSize, FontWeight } from '../../theme/typography';
import { Radius, Layout, Spacing } from '../../theme/spacing';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.warn('[ErrorBoundary]', error, info.componentStack);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text style={styles.emoji}>🙏</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error.message}</Text>
          <TouchableOpacity onPress={this.reset} style={styles.btn} activeOpacity={0.85}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cr,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.horizontalPad,
    gap: Spacing.md,
  },
  emoji: { fontSize: 48 },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.tx,
    textAlign: 'center',
  },
  msg: {
    fontSize: FontSize.smPlus,
    color: Colors.tx3,
    textAlign: 'center',
  },
  btn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.bl,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  btnText: {
    color: Colors.white,
    fontSize: FontSize.smPlus,
    fontWeight: FontWeight.bold,
  },
});
