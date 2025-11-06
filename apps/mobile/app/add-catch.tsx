import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import MapPicker from '../components/MapPicker';

const API_URL = 'https://fishlog-production.up.railway.app';

// Liste over danske fisk
const DANISH_FISH_SPECIES = [
  { label: 'Vælg fiskeart...', value: '' },
  // Ferskvandsfisk
  { label: 'Aborre', value: 'Aborre' },
  { label: 'Ål', value: 'Ål' },
  { label: 'Brasem', value: 'Brasem' },
  { label: 'Gedde', value: 'Gedde' },
  { label: 'Guldkarpe', value: 'Guldkarpe' },
  { label: 'Helt', value: 'Helt' },
  { label: 'Karpe', value: 'Karpe' },
  { label: 'Karusse', value: 'Karusse' },
  { label: 'Knude', value: 'Knude' },
  { label: 'Mals', value: 'Mals' },
  { label: 'Regnbueørred', value: 'Regnbueørred' },
  { label: 'Rudskalle', value: 'Rudskalle' },
  { label: 'Sandart', value: 'Sandart' },
  { label: 'Skalle', value: 'Skalle' },
  { label: 'Skarv', value: 'Skarv' },
  { label: 'Skrubbe', value: 'Skrubbe' },
  { label: 'Stalling', value: 'Stalling' },
  { label: 'Suder', value: 'Suder' },
  { label: 'Sølvkarpe', value: 'Sølvkarpe' },
  { label: 'Ørred', value: 'Ørred' },
  // Saltvandfisk
  { label: 'Flynder', value: 'Flynder' },
  { label: 'Havkat', value: 'Havkat' },
  { label: 'Havørred', value: 'Havørred' },
  { label: 'Hornfisk', value: 'Hornfisk' },
  { label: 'Havtaske', value: 'Havtaske' },
  { label: 'Hvilling', value: 'Hvilling' },
  { label: 'Ising', value: 'Ising' },
  { label: 'Kutling', value: 'Kutling' },
  { label: 'Laks', value: 'Laks' },
  { label: 'Makrel', value: 'Makrel' },
  { label: 'Multe', value: 'Multe' },
  { label: 'Pighvar', value: 'Pighvar' },
  { label: 'Rødspætte', value: 'Rødspætte' },
  { label: 'Sild', value: 'Sild' },
  { label: 'Skrubbe (saltvand)', value: 'Skrubbe (saltvand)' },
  { label: 'Slethvar', value: 'Slethvar' },
  { label: 'Torsk', value: 'Torsk' },
  { label: 'Tunge', value: 'Tunge' },
  { label: 'Ålekvabba', value: 'Ålekvabba' },
];

// Liste over agn (både naturlig og kunstig madding)
const BAIT_TYPES = [
  { label: 'Vælg agn...', value: '' },
  // Naturligt agn
  { label: 'Orm', value: 'Orm' },
  { label: 'Maddike', value: 'Maddike' },
  { label: 'Pier', value: 'Pier' },
  { label: 'Maddiker', value: 'Maddiker' },
  { label: 'Regnorm', value: 'Regnorm' },
  { label: 'Møddinger', value: 'Møddinger' },
  { label: 'Agnat', value: 'Agnat' },
  { label: 'Tobis', value: 'Tobis' },
  { label: 'Sild', value: 'Sild' },
  { label: 'Makrel', value: 'Makrel' },
  { label: 'Rejer', value: 'Rejer' },
  { label: 'Krabber', value: 'Krabber' },
  { label: 'Muslinger', value: 'Muslinger' },
  { label: 'Blæksprutte', value: 'Blæksprutte' },
  { label: 'Boilies', value: 'Boilies' },
  { label: 'Majs', value: 'Majs' },
  { label: 'Brød', value: 'Brød' },
  { label: 'Dej', value: 'Dej' },
  { label: 'Pellets', value: 'Pellets' },
  // Kunstig madding
  { label: 'Wobbler', value: 'Wobbler' },
  { label: 'Spinner', value: 'Spinner' },
  { label: 'Blink', value: 'Blink' },
  { label: 'Gummifisk', value: 'Gummifisk' },
  { label: 'Jig', value: 'Jig' },
  { label: 'Jerk', value: 'Jerk' },
  { label: 'Popper', value: 'Popper' },
  { label: 'Spinnerbait', value: 'Spinnerbait' },
  { label: 'Buzzbait', value: 'Buzzbait' },
  { label: 'Crankbait', value: 'Crankbait' },
  { label: 'Flue', value: 'Flue' },
  { label: 'Nymfe', value: 'Nymfe' },
  { label: 'Streamer', value: 'Streamer' },
  { label: 'Tørflue', value: 'Tørflue' },
  { label: 'Våd flue', value: 'Våd flue' },
  { label: 'Softbait', value: 'Softbait' },
  { label: 'Twister', value: 'Twister' },
  { label: 'Shad', value: 'Shad' },
  { label: 'Creature bait', value: 'Creature bait' },
  { label: 'Jerkbait', value: 'Jerkbait' },
  { label: 'Topwater', value: 'Topwater' },
  { label: 'Spoon', value: 'Spoon' },
  { label: 'Pilk', value: 'Pilk' },
  { label: 'Sluk', value: 'Sluk' },
];

export default function AddCatchScreen() {
  const router = useRouter();
  const [species, setSpecies] = useState('');
  const [lengthCm, setLengthCm] = useState('');
  const [weightG, setWeightG] = useState('');
  const [bait, setBait] = useState('');
  const [forfang, setForfang] = useState('');
  const [technique, setTechnique] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [visibility, setVisibility] = useState<'private' | 'friends' | 'public'>('friends');

  const handleImageSelect = async () => {
    if (Platform.OS === 'web') {
      // Create a file input element
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImage(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // Mobile: Use expo-image-picker
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Tilladelse påkrævet', 'Vi har brug for adgang til dit billedbibliotek for at uploade billeder.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduced quality to 50% to keep file size smaller
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setSelectedImage(base64Image);
      }
    }
  };

  const handleSubmit = async () => {
    if (!species) {
      if (Platform.OS === 'web') {
        alert('Art er påkrævet');
      } else {
        Alert.alert('Fejl', 'Art er påkrævet');
      }
      return;
    }

    setLoading(true);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      // Use selected image if available
      let finalPhotoUrl = selectedImage || undefined;

      const response = await fetch(`${API_URL}/catches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          species,
          lengthCm: lengthCm ? parseFloat(lengthCm) : undefined,
          weightKg: weightG ? parseFloat(weightG) / 1000 : undefined,
          bait: bait || undefined,
          rig: forfang || undefined,
          technique: technique || undefined,
          notes: notes || undefined,
          photoUrl: finalPhotoUrl,
          latitude: latitude ?? undefined,
          longitude: longitude ?? undefined,
          visibility: visibility,
        }),
      });

      if (response.ok) {
        // Navigate directly without showing alert
        router.replace('/catches');
      } else {
        const error = await response.json();
        const errorMsg = error.error || 'Kunne ikke tilføje fangst';
        if (Platform.OS === 'web') {
          alert(`Fejl: ${errorMsg}`);
        } else {
          Alert.alert('Fejl', errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Ukendt fejl';
      if (Platform.OS === 'web') {
        alert(`Fejl: ${errorMsg}`);
      } else {
        Alert.alert('Fejl', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Tilføj Fangst</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Art *</Text>
        {Platform.OS === 'web' ? (
          <select
            value={species}
            onChange={(e: any) => setSpecies(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#ddd',
              fontSize: 16,
              border: '1px solid #ddd',
            }}
            disabled={loading}
          >
            {DANISH_FISH_SPECIES.map((fish) => (
              <option key={fish.value} value={fish.value}>
                {fish.label}
              </option>
            ))}
          </select>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="F.eks. Gedde, Aborre..."
            value={species}
            onChangeText={setSpecies}
            editable={!loading}
          />
        )}

        <Text style={styles.label}>Længde (cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. 65"
          value={lengthCm}
          onChangeText={setLengthCm}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Vægt (g)</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. 3500"
          value={weightG}
          onChangeText={setWeightG}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Agn</Text>
        {Platform.OS === 'web' ? (
          <select
            value={bait}
            onChange={(e: any) => setBait(e.target.value)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#ddd',
              fontSize: 16,
              border: '1px solid #ddd',
            }}
            disabled={loading}
          >
            {BAIT_TYPES.map((baitType) => (
              <option key={baitType.value} value={baitType.value}>
                {baitType.label}
              </option>
            ))}
          </select>
        ) : (
          <TextInput
            style={styles.input}
            placeholder="F.eks. Orm, Wobbler, Spinner..."
            value={bait}
            onChangeText={setBait}
            editable={!loading}
          />
        )}

        <Text style={styles.label}>Forfang</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. Carolina rig..."
          value={forfang}
          onChangeText={setForfang}
          editable={!loading}
        />

        <Text style={styles.label}>Teknik</Text>
        <TextInput
          style={styles.input}
          placeholder="F.eks. Spinning, Flyfishing..."
          value={technique}
          onChangeText={setTechnique}
          editable={!loading}
        />

        <Text style={styles.label}>Foto</Text>

        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        )}

        <TouchableOpacity
          style={[styles.button, styles.uploadButton]}
          onPress={handleImageSelect}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {selectedImage ? '📷 Skift Billede' : '📷 Vælg Billede'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Noter</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Beskriv din oplevelse..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <Text style={styles.label}>Synlighed *</Text>
        {Platform.OS === 'web' ? (
          <select
            value={visibility}
            onChange={(e: any) => setVisibility(e.target.value as 'private' | 'friends' | 'public')}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 8,
              backgroundColor: 'white',
              borderWidth: 1,
              borderColor: '#ddd',
              fontSize: 16,
              border: '1px solid #ddd',
            }}
            disabled={loading}
          >
            <option value="private">🔒 Privat (kun dig)</option>
            <option value="friends">👥 Venner (kun dine venner)</option>
            <option value="public">🌍 Offentlig (alle kan se)</option>
          </select>
        ) : (
          <View style={styles.visibilityContainer}>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'private' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('private')}
              disabled={loading}
            >
              <Text style={[styles.visibilityText, visibility === 'private' && styles.visibilityTextSelected]}>
                🔒 Privat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'friends' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('friends')}
              disabled={loading}
            >
              <Text style={[styles.visibilityText, visibility === 'friends' && styles.visibilityTextSelected]}>
                👥 Venner
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.visibilityOption, visibility === 'public' && styles.visibilityOptionSelected]}
              onPress={() => setVisibility('public')}
              disabled={loading}
            >
              <Text style={[styles.visibilityText, visibility === 'public' && styles.visibilityTextSelected]}>
                🌍 Offentlig
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Fangststed (valgfrit)</Text>
        <MapPicker
          latitude={latitude}
          longitude={longitude}
          onLocationSelect={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
        {latitude && longitude && (
          <Text style={styles.coordinatesText}>
            📍 Valgt position: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Gemmer...' : 'Gem Fangst'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Annuller</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  uploadButton: {
    backgroundColor: '#6c757d',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  coordinatesText: {
    fontSize: 13,
    color: '#333',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    textAlign: 'center',
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  visibilityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  visibilityOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  visibilityTextSelected: {
    color: '#007AFF',
  },
});
