import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface YearbookCatch {
  id: string;
  species: string;
  weightKg?: number;
  lengthCm?: number;
  locationName?: string;
  createdAt: string;
  photoUrl?: string;
  waterTemp?: number;
  bait?: string;
  lure?: string;
  technique?: string;
  released?: boolean;
}

export interface YearbookData {
  userName: string;
  year: number;
  totalCatches: number;
  totalSpecies: number;
  totalWeightKg: number;
  catches: YearbookCatch[];
}

export async function generateAndShareYearbookPDF(data: YearbookData): Promise<void> {
  const topCatches = [...data.catches]
    .sort((a, b) => (b.weightKg || b.lengthCm || 0) - (a.weightKg || a.lengthCm || 0))
    .slice(0, 5);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Hook Fiskebog ${data.year}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #0A2540;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
          }
          .cover {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 4px solid #00D4B2;
            margin-bottom: 30px;
          }
          .logo-badge {
            display: inline-block;
            background: #0A2540;
            color: #00D4B2;
            padding: 12px 28px;
            border-radius: 30px;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 3px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 32px;
            font-weight: 800;
            color: #0A2540;
            margin: 10px 0;
          }
          .subtitle {
            font-size: 16px;
            color: #64748B;
            margin-bottom: 30px;
          }
          .stats-grid {
            display: flex;
            justify-content: space-around;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 35px;
          }
          .stat-box {
            text-align: center;
          }
          .stat-val {
            font-size: 24px;
            font-weight: 800;
            color: #0A2540;
          }
          .stat-lbl {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #94A3B8;
            letter-spacing: 1px;
            margin-top: 4px;
          }
          h2 {
            font-size: 20px;
            border-left: 4px solid #F5A623;
            padding-left: 10px;
            color: #0A2540;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .catch-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .catch-table th {
            background-color: #0A2540;
            color: #FFFFFF;
            font-size: 12px;
            text-align: left;
            padding: 10px;
            font-weight: 700;
          }
          .catch-table td {
            padding: 10px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 12px;
          }
          .catch-table tr:nth-child(even) {
            background-color: #F8FAFC;
          }
          .cr-badge {
            background-color: #DCFCE7;
            color: #16A34A;
            padding: 3px 8px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #94A3B8;
            border-top: 1px solid #E2E8F0;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <div class="logo-badge">HOOK</div>
          <h1>Fiskesæson ${data.year} Årbog</h1>
          <div class="subtitle">Lystfisker: <strong>${data.userName}</strong> • Genereret med Hook Smart Angling</div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-val">${data.totalCatches}</div>
              <div class="stat-lbl">Fangster</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">${data.totalSpecies}</div>
              <div class="stat-lbl">Forskellige Arter</div>
            </div>
            <div class="stat-box">
              <div class="stat-val">${data.totalWeightKg.toFixed(1)} kg</div>
              <div class="stat-lbl">Total Vægt</div>
            </div>
          </div>
        </div>

        <h2>🏆 Årets Største Fangster (Top 5)</h2>
        <table class="catch-table">
          <thead>
            <tr>
              <th>Art</th>
              <th>Vægt / Længde</th>
              <th>Dato</th>
              <th>Agn / Metode</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${topCatches.map((c) => `
              <tr>
                <td><strong>${c.species}</strong></td>
                <td>${c.weightKg ? c.weightKg + ' kg' : ''} ${c.lengthCm ? '(' + c.lengthCm + ' cm)' : ''}</td>
                <td>${new Date(c.createdAt).toLocaleDateString('da-DK')}</td>
                <td>${c.lure || c.bait || c.technique || '-'}</td>
                <td><span class="cr-badge">${c.released !== false ? 'Genudsat' : 'Hjemtaget'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>📖 Komplet Sæsonlog</h2>
        <table class="catch-table">
          <thead>
            <tr>
              <th>Dato</th>
              <th>Art</th>
              <th>Mål</th>
              <th>Agn</th>
              <th>Vandtemp</th>
            </tr>
          </thead>
          <tbody>
            ${data.catches.map((c) => `
              <tr>
                <td>${new Date(c.createdAt).toLocaleDateString('da-DK')}</td>
                <td><strong>${c.species}</strong></td>
                <td>${c.lengthCm ? c.lengthCm + ' cm' : ''} ${c.weightKg ? c.weightKg + ' kg' : ''}</td>
                <td>${c.lure || c.bait || '-'}</td>
                <td>${c.waterTemp ? c.waterTemp + '°C' : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Genereret af Hook App • Verdens førende digitale lystfiskerplatform • Knæk og bræk!
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    if (Platform.OS === 'web') {
      Alert.alert('PDF Genereret', `Din årbog er klar!`);
    } else {
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (error) {
    console.error('PDF export failed:', error);
    Alert.alert('Fejl', 'Kunne ikke generere PDF årbog');
  }
}
