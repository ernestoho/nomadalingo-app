import { StyleSheet, Text, View } from 'react-native';

type Props = {
  missing: string[];
};

/**
 * Shown instead of the app when the backend connection details are absent.
 *
 * Creating the backend client with a missing URL throws at import time, which
 * crashes the app before any screen renders (a white screen with no clue why).
 * This screen turns that silent failure into an actionable message.
 */
export function BackendConfigRequired({ missing }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.mark}>NómadaLingo</Text>
        <Text style={styles.title}>Backend not configured</Text>
        <Text style={styles.body}>
          The app needs its backend connection details before it can start.
        </Text>

        {missing.length > 0 && (
          <View style={styles.list}>
            {missing.map((name) => (
              <Text key={name} style={styles.item}>
                {name}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.body}>
          Add the missing values to a local .env file, or set them in your EAS
          environment, then restart or rebuild.
        </Text>
        <Text style={styles.hint}>.env.example shows the expected names.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF8F1',
    padding: 24,
  },
  card: {
    maxWidth: 420,
    gap: 12,
  },
  mark: {
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#2A9D8F',
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#14304F',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#14304F',
    opacity: 0.8,
  },
  list: {
    gap: 6,
    paddingVertical: 8,
  },
  item: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#14304F',
    backgroundColor: '#EFE7DA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  hint: {
    fontSize: 13,
    color: '#2A9D8F',
  },
});
