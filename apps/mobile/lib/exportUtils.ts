import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export interface Catch {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  lure?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  createdAt: string;
  visibility?: string;
}

export interface Statistics {
  totalCatches: number;
  speciesBreakdown: { species: string; count: number }[];
  averageLength?: number;
  averageWeight?: number;
  personalBests: { species: string; length?: number; weight?: number }[];
  timeline?: { period: string; count: number }[];
}

/**
 * Generate HTML for PDF export of catches
 */
function generateCatchesPDFHTML(catches: Catch[], title: string = 'Mine Fangster'): string {
  const catchesHTML = catches.map((catch_, index) => `
    <div class="catch-card">
      <div class="catch-header">
        <h3>#${index + 1} - ${catch_.species}</h3>
        <span class="date">${new Date(catch_.createdAt).toLocaleDateString('da-DK')}</span>
      </div>
      <div class="catch-details">
        ${catch_.lengthCm ? `<p><strong>Længde:</strong> ${catch_.lengthCm} cm</p>` : ''}
        ${catch_.weightKg ? `<p><strong>Vægt:</strong> ${catch_.weightKg} kg</p>` : ''}
        ${catch_.bait ? `<p><strong>Agn:</strong> ${catch_.bait}</p>` : ''}
        ${catch_.lure ? `<p><strong>Wobler:</strong> ${catch_.lure}</p>` : ''}
        ${catch_.technique ? `<p><strong>Teknik:</strong> ${catch_.technique}</p>` : ''}
        ${catch_.notes ? `<p><strong>Noter:</strong> ${catch_.notes}</p>` : ''}
        ${catch_.latitude && catch_.longitude ? `<p><strong>Lokation:</strong> ${catch_.latitude.toFixed(4)}, ${catch_.longitude.toFixed(4)}</p>` : ''}
      </div>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px;
          background: #f5f7f4;
        }
        .header {
          background: #2C5F4F;
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        .catch-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .catch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 2px solid #f5f7f4;
        }
        .catch-header h3 {
          color: #2C5F4F;
          font-size: 20px;
        }
        .date {
          color: #718096;
          font-size: 14px;
        }
        .catch-details p {
          margin-bottom: 8px;
          line-height: 1.6;
          font-size: 14px;
          color: #4A5568;
        }
        .catch-details strong {
          color: #2D3748;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #718096;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Genereret ${new Date().toLocaleDateString('da-DK')} • ${catches.length} fangster</p>
      </div>
      ${catchesHTML}
      <div class="footer">
        <p>Eksporteret fra Hook - Din digitale fiskebog</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate HTML for PDF export of statistics
 */
function generateStatisticsPDFHTML(stats: Statistics, title: string = 'Mine Statistikker'): string {
  const speciesHTML = stats.speciesBreakdown.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.species}</td>
      <td>${item.count}</td>
      <td>${((item.count / stats.totalCatches) * 100).toFixed(1)}%</td>
    </tr>
  `).join('');

  const pbsHTML = stats.personalBests.map((pb, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${pb.species}</td>
      <td>${pb.length ? `${pb.length} cm` : '-'}</td>
      <td>${pb.weight ? `${pb.weight} kg` : '-'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px;
          background: #f5f7f4;
        }
        .header {
          background: #2C5F4F;
          color: white;
          padding: 30px;
          border-radius: 12px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
          color: #718096;
          font-size: 14px;
          margin-bottom: 10px;
          font-weight: 500;
        }
        .stat-card p {
          color: #2C5F4F;
          font-size: 32px;
          font-weight: 700;
        }
        .table-section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .table-section h2 {
          color: #2C5F4F;
          font-size: 20px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #f5f7f4;
          color: #4A5568;
          font-weight: 600;
          padding: 12px;
          text-align: left;
          font-size: 14px;
        }
        td {
          padding: 12px;
          border-bottom: 1px solid #f5f7f4;
          color: #2D3748;
          font-size: 14px;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #718096;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <p>Genereret ${new Date().toLocaleDateString('da-DK')}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Totale Fangster</h3>
          <p>${stats.totalCatches}</p>
        </div>
        <div class="stat-card">
          <h3>Gns. Længde</h3>
          <p>${stats.averageLength ? `${stats.averageLength.toFixed(1)} cm` : '-'}</p>
        </div>
        <div class="stat-card">
          <h3>Gns. Vægt</h3>
          <p>${stats.averageWeight ? `${stats.averageWeight.toFixed(2)} kg` : '-'}</p>
        </div>
      </div>

      <div class="table-section">
        <h2>Arter Fordeling</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Art</th>
              <th>Antal</th>
              <th>Procent</th>
            </tr>
          </thead>
          <tbody>
            ${speciesHTML}
          </tbody>
        </table>
      </div>

      <div class="table-section">
        <h2>Personlige Rekorder</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Art</th>
              <th>Længde</th>
              <th>Vægt</th>
            </tr>
          </thead>
          <tbody>
            ${pbsHTML}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Eksporteret fra Hook - Din digitale fiskebog</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate CSV content for catches
 */
function generateCatchesCSV(catches: Catch[]): string {
  const headers = ['Dato', 'Art', 'Længde (cm)', 'Vægt (kg)', 'Agn', 'Wobler', 'Teknik', 'Noter', 'Latitude', 'Longitude'];
  const rows = catches.map(catch_ => [
    new Date(catch_.createdAt).toLocaleDateString('da-DK'),
    catch_.species,
    catch_.lengthCm || '',
    catch_.weightKg || '',
    catch_.bait || '',
    catch_.lure || '',
    catch_.technique || '',
    catch_.notes ? `"${catch_.notes.replace(/"/g, '""')}"` : '',
    catch_.latitude || '',
    catch_.longitude || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Export catches to PDF
 */
export async function exportCatchesToPDF(catches: Catch[], title?: string): Promise<void> {
  try {
    const html = generateCatchesPDFHTML(catches, title);
    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Del fangstrapport',
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.log('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting catches to PDF:', error);
    throw error;
  }
}

/**
 * Export statistics to PDF
 */
export async function exportStatisticsToPDF(stats: Statistics, title?: string): Promise<void> {
  try {
    const html = generateStatisticsPDFHTML(stats, title);
    const { uri } = await Print.printToFileAsync({ html });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Del statistikrapport',
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.log('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting statistics to PDF:', error);
    throw error;
  }
}

/**
 * Export catches to CSV
 */
export async function exportCatchesToCSV(catches: Catch[]): Promise<void> {
  try {
    const csv = generateCatchesCSV(catches);
    const fileName = `fangster_${new Date().toISOString().split('T')[0]}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the CSV
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Del fangstdata',
      });
    } else {
      console.log('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting catches to CSV:', error);
    throw error;
  }
}
