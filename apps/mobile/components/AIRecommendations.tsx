import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../lib/api';

interface AIRecommendationsProps {
  species: string;
  latitude: number;
  longitude: number;
  waterTemp?: number;
  windSpeed?: number;
  depth?: number;
  bottomType?: string;
}

interface BaitRecommendation {
  name: string;
  type: string;
  confidence: number;
  reason: string;
}

interface LureRecommendation {
  name: string;
  type: string;
  color: string;
  size: string;
  confidence: number;
  reason: string;
}

interface TechniqueRecommendation {
  name: string;
  description: string;
  confidence: number;
  tips: string[];
}

interface AIResponse {
  species: string;
  success_probability: number;
  best_time: string;
  baits: BaitRecommendation[];
  lures: LureRecommendation[];
  techniques: TechniqueRecommendation[];
  weather_impact: string;
  seasonal_notes: string;
  confidence_score: number;
  model_used: string;
}

export function AIRecommendations(props: AIRecommendationsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIResponse | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    setVisible(true);

    try {
      const payload = {
        species: props.species,
        latitude: props.latitude,
        longitude: props.longitude,
        timestamp: new Date().toISOString(),
        water_temp: props.waterTemp,
        wind_speed: props.windSpeed,
        depth: props.depth,
        bottom_type: props.bottomType,
      };

      const response = await api.post('/ai/recommendations', payload);
      setRecommendations(response.data);
    } catch (error: any) {
      console.error('AI recommendations error:', error);
      Alert.alert(
        'AI Fejl',
        error.response?.data?.error || 'Kunne ikke hente AI anbefalinger'
      );
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#6c757d';
  };

  const getSuccessColor = (probability: number) => {
    if (probability >= 0.7) return '#28a745';
    if (probability >= 0.5) return '#ffc107';
    if (probability >= 0.3) return '#fd7e14';
    return '#dc3545';
  };

  if (!visible) {
    return (
      <TouchableOpacity style={styles.triggerButton} onPress={fetchRecommendations}>
        <Text style={styles.triggerButtonText}>Få AI-Råd</Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Anbefalinger</Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyserer forhold...</Text>
        </View>
      </View>
    );
  }

  if (!recommendations) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Anbefalinger</Text>
        <TouchableOpacity onPress={() => setVisible(false)}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Probability */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fangst Sandsynlighed</Text>
          <View
            style={[
              styles.probabilityBar,
              { backgroundColor: getSuccessColor(recommendations.success_probability) },
            ]}
          >
            <Text style={styles.probabilityText}>
              {(recommendations.success_probability * 100).toFixed(0)}%
            </Text>
          </View>
          <Text style={styles.hint}>Bedste tid: {recommendations.best_time}</Text>
        </View>

        {/* Baits */}
        {recommendations.baits.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Anbefalet Agn</Text>
            {recommendations.baits.map((bait, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{bait.name}</Text>
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: getConfidenceColor(bait.confidence) },
                    ]}
                  >
                    <Text style={styles.confidenceText}>
                      {(bait.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemType}>Type: {bait.type}</Text>
                <Text style={styles.itemReason}>{bait.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Lures */}
        {recommendations.lures.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Anbefalet Wobblers</Text>
            {recommendations.lures.map((lure, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{lure.name}</Text>
                  <View
                    style={[
                      styles.confidenceBadge,
                      { backgroundColor: getConfidenceColor(lure.confidence) },
                    ]}
                  >
                    <Text style={styles.confidenceText}>
                      {(lure.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemDetail}>
                  Farve: {lure.color} | Størrelse: {lure.size}
                </Text>
                <Text style={styles.itemReason}>{lure.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Techniques */}
        {recommendations.techniques.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Teknikker</Text>
            {recommendations.techniques.map((technique, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemName}>{technique.name}</Text>
                <Text style={styles.itemReason}>{technique.description}</Text>
                {technique.tips.length > 0 && (
                  <View style={styles.tipsContainer}>
                    {technique.tips.map((tip, tipIndex) => (
                      <Text key={tipIndex} style={styles.tip}>
                        • {tip}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Weather & Season */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vejr & Sæson</Text>
          <Text style={styles.insight}>{recommendations.weather_impact}</Text>
          <Text style={styles.insight}>{recommendations.seasonal_notes}</Text>
        </View>

        {/* Model Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Model: {recommendations.model_used} | Tillid:{' '}
            {(recommendations.confidence_score * 100).toFixed(0)}%
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  triggerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  probabilityBar: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  probabilityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  itemType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemReason: {
    fontSize: 12,
    color: '#555',
    fontStyle: 'italic',
  },
  tipsContainer: {
    marginTop: 6,
    paddingLeft: 8,
  },
  tip: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  insight: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    padding: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
  },
});
