import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing } from '../theme/colors';

type Props = TextInputProps & {
  containerStyle?: object;
};

export default function AppInput({ containerStyle, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.wrapper,
        focused && styles.wrapperFocused,
        containerStyle,
      ]}
    >
      <TextInput
        placeholderTextColor={colors.textSecondary}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  wrapperFocused: {
    borderColor: colors.primary,
  },
  input: {
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
  },
});