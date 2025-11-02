import { Earthquake } from '../types';

// USGS - Amerika Jeoloji Araştırmaları, dünya çapında anlık deprem verileri
export async function getUSGSData(): Promise<Earthquake[]> {
  try {
    // Son 24 saatteki tüm depremler (Türkiye ve çevresi için)
    const response = await fetch(
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + 
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] +
      '&minlatitude=35&maxlatitude=43&minlongitude=25&maxlongitude=45&orderby=time',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        cache: 'no-store'
      }
    );
    
    if (!response.ok) {
      console.error('USGS response not ok:', response.status);
      return [];
    }
    
    const data = await response.json();
    const earthquakes: Earthquake[] = [];
    
    if (!data.features || !Array.isArray(data.features)) {
      console.error('No features in USGS response');
      return [];
    }
    
    for (let i = 0; i < Math.min(data.features.length, 100); i++) {
      try {
        const feature = data.features[i];
        const props = feature.properties;
        const coords = feature.geometry.coordinates;
        
        const magnitude = props.mag || 0;
        const date = new Date(props.time);
        
        earthquakes.push({
          id: i + 1,
          date: date.toISOString().replace('T', ' ').substring(0, 19),
          timestamp: Math.floor(date.getTime() / 1000),
          latitude: coords[1],
          longitude: coords[0],
          depth: coords[2] || 0,
          size: {
            md: 0,
            ml: magnitude,
            mw: props.magType === 'mw' ? magnitude : 0
          },
          location: props.place || 'Unknown Location',
          attribute: props.type || 'earthquake'
        });
      } catch (err) {
        console.error('Error parsing USGS event:', err);
        continue;
      }
    }
    
    console.log(`USGS: Found ${earthquakes.length} earthquakes`);
    return earthquakes;
  } catch (error) {
    console.error('USGS data fetch error:', error);
    return [];
  }
}
