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
      Alert.alert('Km no válido', 'Ingrese una lectura de odómetro válida mayor que 0.');
      return;
    }
    const last = lastChangeKm(entries);
    if (entries.length > 0 && parsedKm < last) {
      Alert.alert(
        'Km no válido',
        `La lectura de km (${parsedKm}) es menor que el último cambio de aceite (${last} km).`,
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
    Alert.alert('Guardado', 'Cambio de aceite registrado.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar cambio de aceite</Text>
      <Text style={styles.hint}>La fecha se asigna automáticamente a hoy.</Text>

      <Text style={styles.label}>Odómetro (km) *</Text>
      <TextInput
        style={styles.input}
        value={km}
        onChangeText={setKm}
        keyboardType="numeric"
        placeholder="ej. 12500"
      />

      <Text style={styles.label}>Marca de aceite (opcional)</Text>
      <TextInput
        style={styles.input}
        value={brand}
        onChangeText={setBrand}
        placeholder="ej. Motul"
      />

      <Text style={styles.label}>Tipo de aceite (opcional)</Text>
      <TextInput
        style={styles.input}
        value={oilType}
        onChangeText={setOilType}
        placeholder="ej. 10W-40"
      />

      <CheckBox
        label="Filtro de aceite cambiado"
        checked={oilFilterChanged}
        onToggle={() => setOilFilterChanged((prev) => !prev)}
      />
      <CheckBox
        label="Filtro de aire cambiado"
        checked={airFilterChanged}
        onToggle={() => setAirFilterChanged((prev) => !prev)}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar cambio de aceite</Text>
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
