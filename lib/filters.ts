import { Earthquake, SourceType } from './types';

export function filterByLocation(earthquakes: Earthquake[], location: string): Earthquake[] {
  const searchTerm = location.toUpperCase();
  return earthquakes.filter(eq => eq.location.toUpperCase().includes(searchTerm));
}

export function filterBySize(
  earthquakes: Earthquake[],
  size: number,
  sizeType: 'md' | 'ml' | 'mw' = 'ml',
  isGreater: boolean = true
): Earthquake[] {
  return earthquakes.filter(eq => {
    const magnitude = eq.size[sizeType];
    return isGreater ? magnitude >= size : magnitude <= size;
  });
}

export function filterByTime(
  earthquakes: Earthquake[],
  hours: number,
  sourceType: SourceType
): Earthquake[] {
  const now = new Date();
  const cutoffTime = now.getTime() - hours * 60 * 60 * 1000;
  
  return earthquakes.filter(eq => {
    let eqTime: Date;
    
    if (sourceType === 'afad') {
      eqTime = new Date(eq.date);
    } else {
      const [datePart, timePart] = eq.date.split(' ');
      const [year, month, day] = datePart.split('.');
      eqTime = new Date(`${year}-${month}-${day}T${timePart}`);
    }
    
    return eqTime.getTime() >= cutoffTime;
  });
}
