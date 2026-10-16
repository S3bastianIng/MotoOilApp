import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaintenanceSettings, OilChangeEntry, buildEntry, lastChangeKm } from '../lib/oilLogic';

interface Props {
  entries: OilChangeEntry[];
  settings: MaintenanceSettings;
  onSave: (entry: OilChangeEntry) => void;
}

function CheckBox({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} accessibilityRole="checkbox">
      <Text style={styles.checkBox}>{checked ? '[X]' : '[ ]'}</Text>
      <Text style={styles.checkLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function RegisterScreen({ entries, settings, onSave }: Props) {
  const [km, setKm] = useState(String(settings.currentKm));
  const [brand, setBrand] = useState('');
  const [oilType, setOilType] = useState('');
  const [oilFilterChanged, setOilFilterChanged] = useState(false);
  const [airFilterChanged, setAirFilterChanged] = useState(false);

  const handleSave = () => {
    const parsedKm = Number(km);
    if (!Number.isFinite(parsedKm) || parsedKm <= 0) {
      Alert.alert('Invalid km', 'Please enter a valid odometer reading greater than 0.');
      return;
    }
    const last = lastChangeKm(entries);
    if (entries.length > 0 && parsedKm < last) {
      Alert.alert(
        'Invalid km',
        `The km reading (${parsedKm}) is lower than the last oil change (${last} km).`,
      );
      return;
    }
    onSave(
      buildEntry({
        km: Math.floor(parsedKm),
        brand,
        oilType,
        oilFilterChanged,
        airFilterChanged,
      }),
    );
    setKm(String(Math.floor(parsedKm)));
    setBrand('');
    setOilType('');
    setOilFilterChanged(false);
    setAirFilterChanged(false);
    Alert.alert('Saved', 'Oil change registered.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register oil change</Text>
      <Text style={styles.hint}>Date is set automatically to today.</Text>

      <Text style={styles.label}>Odometer (km) *</Text>
      <TextInput
        style={styles.input}
        value={km}
        onChangeText={setKm}
        keyboardType="numeric"
        placeholder="e.g. 12500"
      />

      <Text style={styles.label}>Oil brand (optional)</Text>
      <TextInput
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
        placeholder="e.g. Motul"
      />

      <Text style={styles.label}>Oil type (optional)</Text>
      <TextInput
        style={styles.input}
        value={oilType}
        onChangeText={setOilType}
        placeholder="e.g. 10W-40"
      />

      <CheckBox
        label="Oil filter changed"
        checked={oilFilterChanged}
        onToggle={() => setOilFilterChanged((prev) => !prev)}
      />
      <CheckBox
        label="Air filter changed"
        checked={airFilterChanged}
        onToggle={() => setAirFilterChanged((prev) => !prev)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save oil change</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, backgroundColor: '#f4f6f8' },
  title: { fontSize: 24, fontWeight: '700' },
  hint: { fontSize: 13, color: '#777', marginBottom: 8 },
  label: { fontSize: 14, color: '#555', marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  checkBox: { fontSize: 18, fontWeight: '700', width: 40 },
  checkLabel: { fontSize: 16 },
  button: {
    marginTop: 20,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
