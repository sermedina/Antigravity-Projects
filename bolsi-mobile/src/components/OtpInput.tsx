import React, { useRef } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
  error?: boolean;
}

export default function OtpInput({ value, onChange, length = 6, error = false }: OtpInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const codeArray = Array(length).fill('');

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.boxContainer}>
        {codeArray.map((_, index) => {
          const char = value[index] || '';
          const isFocused = value.length === index;

          // Determine border color based on focus/error state
          let borderColor = theme.colors.outline;
          if (error) {
            borderColor = theme.colors.error;
          } else if (isFocused) {
            borderColor = theme.colors.primary;
          }

          return (
            <View
              key={index}
              style={[
                styles.box,
                {
                  borderColor,
                  borderWidth: isFocused || error ? 2 : 1,
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.text,
                  {
                    color: error ? theme.colors.error : theme.colors.onSurface,
                  },
                ]}
              >
                {char}
              </Text>
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          // Keep only numeric characters
          const cleanText = text.replace(/[^0-9]/g, '');
          if (cleanText.length <= length) {
            onChange(cleanText);
          }
        }}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        caretHidden={true}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
  },
  box: {
    flex: 1,
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
});
