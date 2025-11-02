import { Earthquake } from './types';

interface CacheData {
  data: Earthquake[];
  timestamp: number;
}

const cache = new Map<string, CacheData>();
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '5') * 60 * 1000;

export function getCache(key: string): Earthquake[] | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCache(key: string, data: Earthquake[]): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache(): void {
  cache.clear();
}
