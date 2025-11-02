export interface EarthquakeSize {
  md: number;
  ml: number;
  mw: number;
}

export interface AfadDetails {
  id: string;
  refId: string;
}

export interface Earthquake {
  id: number;
  date: string;
  timestamp: number;
  latitude: number;
  longitude: number;
  depth: number;
  size: EarthquakeSize;
  location: string;
  attribute: string;
  afadDetails?: AfadDetails;
}

export type SourceType = 'kandilli' | 'afad' | 'depremio' | 'usgs';

export interface EarthquakeResponse {
  earthquakes: Earthquake[];
  source: SourceType;
  cached: boolean;
  timestamp: number;
}

export interface FilterParams {
  type?: SourceType;
  location?: string;
  size?: number;
  sizeType?: 'md' | 'ml' | 'mw';
  isGreater?: boolean;
  hour?: number;
}
