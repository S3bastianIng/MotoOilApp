import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaintenanceSettings, OilChangeEntry, sortByKm } from './src/lib/oilLogic';
import { loadEntries, loadSettings, saveEntries, saveSettings } from './src/lib/storage';
import DashboardScreen from './src/screens/DashboardScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Tab = 'dashboard' | 'register' | 'history' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'register', label: 'Register' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [entries, setEntries] = useState<OilChangeEntry[] | null>(null);
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);

  useEffect(() => {
    async function init() {
      const [loadedEntries, loadedSettings] = await Promise.all([loadEntries(), loadSettings()]);
      setEntries(loadedEntries);
      setSettings(loadedSettings);
    }
    init();
  }, []);

  const handleSaveEntry = async (entry: OilChangeEntry) => {
    if (entries === null || settings === null) return;
    const updated = [...entries, entry];
    setEntries(updated);
    await saveEntries(updated);
    // Keep the odometer in sync when the registered km is ahead.
    if (entry.km > settings.currentKm) {
      const updatedSettings = { ...settings, currentKm: entry.km };
      setSettings(updatedSettings);
      await saveSettings(updatedSettings);
    }
    setTab('dashboard');
  };

  const handleDeleteLast = async () => {
    if (entries === null || entries.length === 0) return;
    const sorted = sortByKm(entries);
    const last = sorted[sorted.length - 1];
    const updated = entries.filter((entry) => entry.id !== last.id);
    setEntries(updated);
    await saveEntries(updated);
  };

  const handleSaveSettings = async (next: MaintenanceSettings) => {
    setSettings(next);
    await saveSettings(next);
  };

  if (entries === null || settings === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        {tab === 'dashboard' && <DashboardScreen entries={entries} settings={settings} />}
        {tab === 'register' && (
          <RegisterScreen entries={entries} settings={settings} onSave={handleSaveEntry} />
        )}
        {tab === 'history' && <HistoryScreen entries={entries} onDeleteLast={handleDeleteLast} />}
        {tab === 'settings' && <SettingsScreen settings={settings} onSave={handleSaveSettings} />}
      </View>
      <View style={styles.tabBar}>
        {TABS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, tab === item.key && styles.tabActive]}
            onPress={() => setTab(item.key)}
          >
            <Text style={[styles.tabText, tab === item.key && styles.tabTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f8' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderTopWidth: 3, borderTopColor: '#1a73e8' },
  tabText: { fontSize: 13, color: '#777' },
  tabTextActive: { color: '#1a73e8', fontWeight: '700' },
});
