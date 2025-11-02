import * as cheerio from 'cheerio';
import { Earthquake } from '../types';

export async function getKandilliData(): Promise<Earthquake[]> {
  try {
    const response = await fetch('http://www.koeri.boun.edu.tr/scripts/lst0.asp', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.error('Kandilli response not ok:', response.status);
      return [];
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const preText = $('pre').text();
    
    if (!preText) {
      console.error('No pre text found');
      return [];
    }
    
    // Split by the separator line - try different separators
    let dataSection = '';
    
    if (preText.includes('------------------------------------------------------------------------------')) {
      const parts = preText.split('------------------------------------------------------------------------------');
      if (parts.length >= 3) {
        dataSection = parts[2];
      } else if (parts.length >= 2) {
        dataSection = parts[1];
      }
    } else if (preText.includes('----------')) {
      const parts = preText.split('----------');
      if (parts.length >= 2) {
        dataSection = parts[parts.length - 1];
      }
    } else {
      // Try to find data after "Tarih" header
      const lines = preText.split('\n');
      const startIndex = lines.findIndex(line => line.includes('Tarih') && line.includes('Enlem'));
      if (startIndex >= 0) {
        dataSection = lines.slice(startIndex + 1).join('\n');
      }
    }
    
    if (!dataSection) {
      console.error('Could not find data section');
      return [];
    }
    
    const dataLines = dataSection.trim().split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 50 && /^\d{4}\.\d{2}\.\d{2}/.test(trimmed);
    });
    const earthquakes: Earthquake[] = [];
    
    for (let i = 0; i < Math.min(dataLines.length, 100); i++) {
      try {
        const line = dataLines[i].trim();
        const cleaned = line.replace(/\s+/g, ' ');
        const parts = cleaned.split(' ');
        
        if (parts.length < 8) continue;
        
        const date = parts[0];
        const time = parts[1];
        const lat = parseFloat(parts[2]);
        const lon = parseFloat(parts[3]);
        const depth = parseFloat(parts[4]);
        const md = parts[5] === '-.-' ? 0 : parseFloat(parts[5]);
        const ml = parts[6] === '-.-' ? 0 : parseFloat(parts[6]);
        const mw = parts[7] === '-.-' ? 0 : parseFloat(parts[7]);
        
        if (isNaN(lat) || isNaN(lon) || isNaN(depth)) continue;
        
        const locationStart = cleaned.indexOf(parts[8]);
        const locationPart = cleaned.substring(locationStart);
        const location = locationPart.split(/İlksel|REVIZE/)[0].trim();
        const attribute = locationPart.includes('İlksel') ? 'İlksel' : 
                         locationPart.includes('REVIZE') ? 'REVIZE' : '';
        
        const dateTime = `${date} ${time}`;
        const timestamp = Math.floor(new Date(dateTime.replace(/\./g, '-').replace(' ', 'T')).getTime() / 1000);
        
        earthquakes.push({
          id: i + 1,
          date: dateTime,
          timestamp,
          latitude: lat,
          longitude: lon,
          depth,
          size: { md, ml, mw },
          location,
          attribute
        });
      } catch (err) {
        console.error('Error parsing line:', err);
        continue;
      }
    }
    
    console.log(`Kandilli: Found ${earthquakes.length} earthquakes`);
    return earthquakes;
  } catch (error) {
    console.error('Kandilli data fetch error:', error);
    return [];
  }
}
