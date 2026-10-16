import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaintenanceSettings } from '../lib/oilLogic';

interface Props {
  settings: MaintenanceSettings;
  onSave: (settings: MaintenanceSettings) => void;
}

export default function SettingsScreen({ settings, onSave }: Props) {
  const [oilInterval, setOilInterval] = useState(String(settings.oilInterval));
  const [oilFilterKm, setOilFilterKm] = useState(String(settings.oilFilterKm));
  const [airFilterKm, setAirFilterKm] = useState(String(settings.airFilterKm));
  const [currentKm, setCurrentKm] = useState(String(settings.currentKm));

  const handleSave = () => {
    const parsed = {
      oilInterval: Number(oilInterval),
      oilFilterKm: Number(oilFilterKm),
      airFilterKm: Number(airFilterKm),
      currentKm: Number(currentKm),
    };
    if (
      !Number.isFinite(parsed.oilInterval) ||
      !Number.isFinite(parsed.oilFilterKm) ||
      !Number.isFinite(parsed.airFilterKm) ||
      !Number.isFinite(parsed.currentKm) ||
      parsed.oilInterval <= 0 ||
      parsed.oilFilterKm <= 0 ||
      parsed.airFilterKm <= 0 ||
      parsed.currentKm < 0
    ) {
      Alert.alert(
        'Invalid values',
        'Intervals must be greater than 0 and the odometer must be 0 or higher.',
      );
      return;
    }
    onSave({
      oilInterval: Math.floor(parsed.oilInterval),
      oilFilterKm: Math.floor(parsed.oilFilterKm),
      airFilterKm: Math.floor(parsed.airFilterKm),
      currentKm: Math.floor(parsed.currentKm),
    });
    Alert.alert('Saved', 'Settings updated.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.hint}>
        Defaults: oil every 2500 km, oil filter every 5000 km, air filter every 7500 km.
      </Text>

      <Text style={styles.label}>Oil change interval (km)</Text>
      <TextInput
        style={styles.input}
        value={oilInterval}
        onChangeText={setOilInterval}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Oil filter interval (km)</Text>
      <TextInput
        style={styles.input}
        value={oilFilterKm}
        onChangeText={setOilFilterKm}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Air filter interval (km)</Text>
      <TextInput
        style={styles.input}
        value={airFilterKm}
        onChangeText={setAirFilterKm}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Current odometer (km)</Text>
      <TextInput
        style={styles.input}
        value={currentKm}
        onChangeText={setCurrentKm}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save settings</Text>
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
  button: {
    marginTop: 20,
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
