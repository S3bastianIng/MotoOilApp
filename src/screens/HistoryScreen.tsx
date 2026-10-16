import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OilChangeEntry, sortByKm } from '../lib/oilLogic';

interface Props {
  entries: OilChangeEntry[];
  onDeleteLast: () => void;
}

function formatEntry(entry: OilChangeEntry): string {
  const parts = [`${entry.date}`, `${entry.km} km`];
  const filters: string[] = [];
  filters.push(entry.oilFilterChanged ? 'filtro de aceite: SÍ' : 'filtro de aceite: no');
  filters.push(entry.airFilterChanged ? 'filtro de aire: SÍ' : 'filtro de aire: no');
  const details = [entry.brand, entry.oilType].filter(Boolean).join(' ');
  return `${parts.join(' - ')}${details ? ` (${details})` : ''} - ${filters.join(', ')}`;
}

export default function HistoryScreen({ entries, onDeleteLast }: Props) {
  const sortedDesc = sortByKm(entries).reverse();

  const confirmDeleteLast = () => {
    if (entries.length === 0) return;
    const last = sortByKm(entries)[entries.length - 1];
    Alert.alert(
      'Eliminar último registro',
      `¿Eliminar el registro más reciente (${last.date}, ${last.km} km)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: onDeleteLast },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial</Text>
      {sortedDesc.length === 0 ? (
        <Text style={styles.empty}>Aún no hay cambios de aceite registrados.</Text>
      ) : (
        <FlatList
          data={sortedDesc}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.entry}>{formatEntry(item)}</Text>
            </View>
          )}
        />
      )}
      <TouchableOpacity
        style={[styles.button, entries.length === 0 && styles.buttonDisabled]}
        onPress={confirmDeleteLast}
        disabled={entries.length === 0}
      >
        <Text style={styles.buttonText}>Eliminar último registro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#f4f6f8' },
  title: { fontSize: 24, fontWeight: '700' },
  empty: { fontSize: 15, color: '#777', marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  entry: { fontSize: 15 },
  button: {
    marginTop: 8,
    backgroundColor: '#d9534f',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
