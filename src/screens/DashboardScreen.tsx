import { StyleSheet, Text, View } from 'react-native';
import {
  MaintenanceSettings,
  OilChangeEntry,
  isAirFilterDueNext,
  isOilFilterDueNext,
  kmRemaining,
  kmSinceLastChange,
  lastChangeKm,
  nextOilKm,
  oilStatus,
} from '../lib/oilLogic';

interface Props {
  entries: OilChangeEntry[];
  settings: MaintenanceSettings;
}

function DueBadge({ due }: { due: boolean }) {
  return (
    <View style={[styles.badge, due ? styles.badgeYes : styles.badgeNo]}>
      <Text style={styles.badgeText}>{due ? 'SÍ' : 'NO'}</Text>
    </View>
  );
}

export default function DashboardScreen({ entries, settings }: Props) {
  const last = lastChangeKm(entries);
  const next = nextOilKm(entries, settings);
  const since = kmSinceLastChange(entries, settings);
  const remaining = kmRemaining(entries, settings);
  const status = oilStatus(entries, settings);
  const oilFilterDue = isOilFilterDueNext(entries, settings);
  const airFilterDue = isAirFilterDueNext(entries, settings);

  const statusStyle =
    status === 'DUE' ? styles.statusDue : status === 'URGENT' ? styles.statusUrgent : styles.statusOk;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panel</Text>

      <View style={[styles.statusCard, statusStyle]}>
        <Text style={styles.statusText}>
          {status === 'DUE'
            ? 'CAMBIO DE ACEITE VENCIDO'
            : status === 'URGENT'
              ? 'CAMBIO DE ACEITE URGENTE'
              : 'ACEITE EN ORDEN'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Odómetro actual</Text>
        <Text style={styles.value}>{settings.currentKm} km</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Desde el último cambio</Text>
          <Text style={styles.value}>{since} km</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Restantes</Text>
          <Text style={styles.value}>{remaining} km</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Próximo cambio de aceite</Text>
        <Text style={styles.value}>{next} km</Text>
        <Text style={styles.hint}>(último cambio {last} km + intervalo {settings.oilInterval} km)</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Filtro de aceite en el próximo cambio</Text>
          <DueBadge due={oilFilterDue} />
        </View>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Filtro de aire en el próximo cambio</Text>
          <DueBadge due={airFilterDue} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: '#f4f6f8' },
  title: { fontSize: 24, fontWeight: '700' },
  statusCard: { borderRadius: 10, padding: 14, alignItems: 'center' },
  statusOk: { backgroundColor: '#dff0d8' },
  statusUrgent: { backgroundColor: '#fcf0c8' },
  statusDue: { backgroundColor: '#f5c6c6' },
  statusText: { fontSize: 18, fontWeight: '800' },
  card: { backgroundColor: '#ffffff', borderRadius: 10, padding: 14 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { fontSize: 14, color: '#555' },
  value: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  hint: { fontSize: 12, color: '#888', marginTop: 4 },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  badge: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  badgeYes: { backgroundColor: '#d9534f' },
  badgeNo: { backgroundColor: '#5cb85c' },
  badgeText: { color: '#fff', fontWeight: '700' },
});
