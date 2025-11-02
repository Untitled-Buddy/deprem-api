import { Earthquake } from '../types';

// Deprem.io - Topluluk tabanlı, anlık deprem bildirimleri
export async function getDepremIoData(): Promise<Earthquake[]> {
  try {
    const response = await fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error('Deprem.io response not ok:', response.status);
      return [];
    }
    
    const data = await response.json();
    const earthquakes: Earthquake[] = [];
    
    if (!data.result || !Array.isArray(data.result)) {
      console.error('No result in Deprem.io response');
      return [];
    }
    
    for (let i = 0; i < Math.min(data.result.length, 100); i++) {
      try {
        const event = data.result[i];
        const coords = event.geojson?.coordinates || [0, 0];
        const date = event.date || new Date().toISOString();
        
        earthquakes.push({
          id: i + 1,
          date: date.replace('T', ' ').substring(0, 19),
          timestamp: Math.floor(new Date(date).getTime() / 1000),
          latitude: coords[1],
          longitude: coords[0],
          depth: parseFloat(event.depth) || 0,
          size: {
            md: 0,
            ml: parseFloat(event.mag) || 0,
            mw: 0
          },
          location: event.title || 'Bilinmeyen Konum',
          attribute: 'İlksel'
        });
      } catch (err) {
        console.error('Error parsing Deprem.io event:', err);
        continue;
      }
    }
    
    console.log(`Deprem.io: Found ${earthquakes.length} earthquakes`);
    return earthquakes;
  } catch (error) {
    console.error('Deprem.io data fetch error:', error);
    return [];
  }
}
