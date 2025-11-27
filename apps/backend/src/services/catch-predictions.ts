import { prisma } from "../lib/prisma";
import Groq from 'groq-sdk';


interface PredictionFactors {
  timeOfDay: { hour: number; successRate: number; avgCatches: number }[];
  seasonality: { month: number; successRate: number; avgCatches: number }[];
  weather: { conditions: string; avgCatches: number }[];
  moonPhase: { phase: string; avgCatches: number }[];
  topLocations: { lat: number; lng: number; catchCount: number }[];
  topSpecies: { species: string; bestTime: string; bestMonth: number }[];
}

interface Prediction {
  confidence: number; // 0-100
  recommendation: string;
  bestTimeToday: { hour: number; description: string };
  bestDaysThisWeek: string[];
  topSpeciesPredictions: { species: string; likelihood: number }[];
  factors: PredictionFactors;
  aiInsights: string[];
}

class CatchPredictionService {
  /**
   * Generate catch predictions for a user
   */
  async generatePredictions(userId: string, userApiKey?: string): Promise<Prediction> {
    try {
      // Get user's historical catch data
      const catches = await prisma.catch.findMany({
        where: {
          userId,
          isDraft: false,
        },
        include: {
          weatherData: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (catches.length === 0) {
        return this.getDefaultPrediction();
      }

      // Analyze patterns
      const factors = this.analyzePatterns(catches);

      // Generate AI insights
      const aiInsights = await this.generateAIInsights(catches, factors, userApiKey);

      // Calculate best times
      const bestTimeToday = this.getBestTimeToday(factors);
      const bestDaysThisWeek = this.getBestDaysThisWeek(factors);
      const topSpeciesPredictions = this.getSpeciesPredictions(factors);

      // Calculate overall confidence
      const confidence = this.calculateConfidence(catches.length, factors);

      return {
        confidence,
        recommendation: this.generateRecommendation(bestTimeToday, factors),
        bestTimeToday,
        bestDaysThisWeek,
        topSpeciesPredictions,
        factors,
        aiInsights,
      };
    } catch (error) {
      console.error('Error generating predictions:', error);
      return this.getDefaultPrediction();
    }
  }

  /**
   * Analyze patterns from historical catches
   */
  private analyzePatterns(catches: any[]): PredictionFactors {
    // Time of day analysis
    const hourlyStats = new Map<number, { count: number; total: number }>();
    catches.forEach((catch_) => {
      const hour = new Date(catch_.createdAt).getHours();
      const stats = hourlyStats.get(hour) || { count: 0, total: 0 };
      stats.count++;
      stats.total++;
      hourlyStats.set(hour, stats);
    });

    const timeOfDay = Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        successRate: (stats.count / catches.length) * 100,
        avgCatches: stats.count,
      }))
      .sort((a, b) => b.avgCatches - a.avgCatches);

    // Seasonality analysis
    const monthlyStats = new Map<number, { count: number }>();
    catches.forEach((catch_) => {
      const month = new Date(catch_.createdAt).getMonth();
      const stats = monthlyStats.get(month) || { count: 0 };
      stats.count++;
      monthlyStats.set(month, stats);
    });

    const seasonality = Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({
        month,
        successRate: (stats.count / catches.length) * 100,
        avgCatches: stats.count,
      }))
      .sort((a, b) => b.avgCatches - a.avgCatches);

    // Weather analysis
    const weatherStats = new Map<string, number>();
    catches.forEach((catch_) => {
      if (catch_.weatherData?.conditions) {
        const condition = catch_.weatherData.conditions;
        weatherStats.set(condition, (weatherStats.get(condition) || 0) + 1);
      }
    });

    const weather = Array.from(weatherStats.entries())
      .map(([conditions, count]) => ({
        conditions,
        avgCatches: count,
      }))
      .sort((a, b) => b.avgCatches - a.avgCatches);

    // Moon phase analysis
    const moonStats = new Map<string, number>();
    catches.forEach((catch_) => {
      if (catch_.weatherData?.moonPhase) {
        const phase = catch_.weatherData.moonPhase;
        moonStats.set(phase, (moonStats.get(phase) || 0) + 1);
      }
    });

    const moonPhase = Array.from(moonStats.entries())
      .map(([phase, count]) => ({
        phase,
        avgCatches: count,
      }))
      .sort((a, b) => b.avgCatches - a.avgCatches);

    // Location analysis
    const locationStats = new Map<string, { lat: number; lng: number; count: number }>();
    catches.forEach((catch_) => {
      if (catch_.latitude && catch_.longitude) {
        const key = `${catch_.latitude.toFixed(2)},${catch_.longitude.toFixed(2)}`;
        const stats = locationStats.get(key) || {
          lat: catch_.latitude,
          lng: catch_.longitude,
          count: 0,
        };
        stats.count++;
        locationStats.set(key, stats);
      }
    });

    const topLocations = Array.from(locationStats.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((loc) => ({ lat: loc.lat, lng: loc.lng, catchCount: loc.count }));

    // Species analysis
    const speciesStats = new Map<string, { hours: number[]; months: number[] }>();
    catches.forEach((catch_) => {
      if (catch_.species) {
        const stats = speciesStats.get(catch_.species) || { hours: [], months: [] };
        stats.hours.push(new Date(catch_.createdAt).getHours());
        stats.months.push(new Date(catch_.createdAt).getMonth());
        speciesStats.set(catch_.species, stats);
      }
    });

    const topSpecies = Array.from(speciesStats.entries())
      .slice(0, 5)
      .map(([species, stats]) => {
        const avgHour = Math.round(stats.hours.reduce((a, b) => a + b, 0) / stats.hours.length);
        const bestMonth = stats.months.sort((a, b) =>
          stats.months.filter((m) => m === a).length -
          stats.months.filter((m) => m === b).length
        )[0];

        return {
          species,
          bestTime: `${avgHour}:00`,
          bestMonth,
        };
      });

    return {
      timeOfDay: timeOfDay.slice(0, 10),
      seasonality: seasonality.slice(0, 12),
      weather: weather.slice(0, 5),
      moonPhase: moonPhase.slice(0, 4),
      topLocations,
      topSpecies,
    };
  }

  /**
   * Generate AI insights using Groq
   */
  private async generateAIInsights(catches: any[], factors: PredictionFactors, userApiKey?: string): Promise<string[]> {
    try {
      const apiKey = userApiKey || process.env.GROQ_API_KEY;
      if (!apiKey) {
        return this.getFallbackInsights(factors);
      }

      const groq = new Groq({ apiKey });

      const prompt = `Du er en ekspert i fiskeri-analyse. Baseret på følgende data, giv 3-5 korte indsigter på dansk om de bedste tidspunkter at fiske:

Antal fangster: ${catches.length}
Top tider: ${factors.timeOfDay.slice(0, 3).map((t) => `${t.hour}:00 (${t.avgCatches} fangster)`).join(', ')}
Top måneder: ${factors.seasonality.slice(0, 3).map((s) => `Måned ${s.month + 1} (${s.avgCatches} fangster)`).join(', ')}
${factors.weather.length > 0 ? `Top vejr: ${factors.weather[0].conditions}` : ''}

Giv specifikke, handlingsrettede råd.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter((line) => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getFallbackInsights(factors);
    }
  }

  /**
   * Get fallback insights when AI is unavailable
   */
  private getFallbackInsights(factors: PredictionFactors): string[] {
    const insights: string[] = [];

    if (factors.timeOfDay.length > 0) {
      const best = factors.timeOfDay[0];
      insights.push(`Dine bedste fangster er omkring kl. ${best.hour}:00`);
    }

    if (factors.seasonality.length > 0) {
      const months = ['Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'];
      const best = factors.seasonality[0];
      insights.push(`${months[best.month]} er din bedste måned med ${best.avgCatches} fangster`);
    }

    if (factors.weather.length > 0) {
      insights.push(`Du fanger mest når vejret er: ${factors.weather[0].conditions}`);
    }

    if (factors.moonPhase.length > 0) {
      insights.push(`Månefase "${factors.moonPhase[0].phase}" giver gode resultater`);
    }

    return insights;
  }

  /**
   * Get best time to fish today
   */
  private getBestTimeToday(factors: PredictionFactors): { hour: number; description: string } {
    if (factors.timeOfDay.length === 0) {
      return { hour: 6, description: 'Tidlig morgen (baseret på generelle mønstre)' };
    }

    const best = factors.timeOfDay[0];
    const timeDescriptions: { [key: number]: string } = {
      5: 'Tidlig morgen', 6: 'Tidlig morgen', 7: 'Morgen',
      8: 'Morgen', 9: 'Formiddag', 10: 'Formiddag', 11: 'Sent formiddag',
      12: 'Middag', 13: 'Tidlig eftermiddag', 14: 'Eftermiddag',
      15: 'Eftermiddag', 16: 'Sen eftermiddag', 17: 'Tidlig aften',
      18: 'Aften', 19: 'Aften', 20: 'Skumring', 21: 'Skumring',
    };

    return {
      hour: best.hour,
      description: timeDescriptions[best.hour] || `Kl. ${best.hour}:00`,
    };
  }

  /**
   * Get best days this week
   */
  private getBestDaysThisWeek(factors: PredictionFactors): string[] {
    // Simple prediction based on current month's success
    const currentMonth = new Date().getMonth();
    const monthData = factors.seasonality.find((s) => s.month === currentMonth);

    if (!monthData || monthData.successRate < 10) {
      return ['Lørdag', 'Søndag']; // Default to weekends
    }

    // Predict based on historical patterns
    return ['Lørdag', 'Søndag', 'Fredag'];
  }

  /**
   * Get species predictions
   */
  private getSpeciesPredictions(factors: PredictionFactors): { species: string; likelihood: number }[] {
    return factors.topSpecies.map((sp, index) => ({
      species: sp.species,
      likelihood: Math.max(90 - index * 15, 40),
    }));
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(catchCount: number, factors: PredictionFactors): number {
    let confidence = 0;

    // Base confidence on catch count
    if (catchCount >= 50) confidence += 40;
    else if (catchCount >= 20) confidence += 30;
    else if (catchCount >= 10) confidence += 20;
    else confidence += 10;

    // Add confidence for having weather data
    if (factors.weather.length > 0) confidence += 15;

    // Add confidence for having location data
    if (factors.topLocations.length > 0) confidence += 15;

    // Add confidence for diverse time data
    if (factors.timeOfDay.length >= 5) confidence += 15;

    // Add confidence for seasonality data
    if (factors.seasonality.length >= 6) confidence += 15;

    return Math.min(confidence, 95); // Max 95% confidence
  }

  /**
   * Generate recommendation text
   */
  private generateRecommendation(bestTime: { hour: number; description: string }, factors: PredictionFactors): string {
    let rec = `Prøv at fiske ${bestTime.description.toLowerCase()}`;

    if (factors.topLocations.length > 0) {
      rec += ' på dine kendte gode spots';
    }

    if (factors.weather.length > 0) {
      rec += `, især når vejret er ${factors.weather[0].conditions.toLowerCase()}`;
    }

    return rec + '.';
  }

  /**
   * Get default prediction for users with no data
   */
  private getDefaultPrediction(): Prediction {
    return {
      confidence: 0,
      recommendation: 'Start med at logge dine fangster for at få personlige forudsigelser!',
      bestTimeToday: { hour: 6, description: 'Tidlig morgen' },
      bestDaysThisWeek: ['Lørdag', 'Søndag'],
      topSpeciesPredictions: [],
      factors: {
        timeOfDay: [],
        seasonality: [],
        weather: [],
        moonPhase: [],
        topLocations: [],
        topSpecies: [],
      },
      aiInsights: [
        'Tidlig morgen og sen eftermiddag er generelt gode tider',
        'Skyet vejr kan være bedre end solrigt vejr',
        'Fuldmåne kan øge aktiviteten',
      ],
    };
  }
}

export const catchPredictionService = new CatchPredictionService();
