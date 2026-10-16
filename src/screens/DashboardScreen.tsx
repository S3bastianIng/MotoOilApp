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
      <Text style={styles.badgeText}>{due ? 'YES' : 'NO'}</Text>
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
      <Text style={styles.title}>Dashboard</Text>

      <View style={[styles.statusCard, statusStyle]}>
        <Text style={styles.statusText}>
          {status === 'DUE'
            ? 'OIL CHANGE DUE'
            : status === 'URGENT'
              ? 'OIL CHANGE URGENT'
              : 'OIL OK'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current odometer</Text>
        <Text style={styles.value}>{settings.currentKm} km</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Since last change</Text>
          <Text style={styles.value}>{since} km</Text>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>Remaining</Text>
          <Text style={styles.value}>{remaining} km</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Next oil change at</Text>
        <Text style={styles.value}>{next} km</Text>
        <Text style={styles.hint}>(last change {last} km + interval {settings.oilInterval} km)</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Oil filter due on next change</Text>
          <DueBadge due={oilFilterDue} />
        </View>
        <View style={styles.badgeRow}>
          <Text style={styles.label}>Air filter due on next change</Text>
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
