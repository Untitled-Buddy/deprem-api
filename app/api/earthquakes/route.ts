import { NextRequest, NextResponse } from 'next/server';
import { getKandilliData } from '@/lib/scrapers/kandilli';
import { getAfadData } from '@/lib/scrapers/afad';
import { filterByLocation, filterBySize, filterByTime } from '@/lib/filters';
import { getCache, setCache } from '@/lib/cache';
import { Earthquake, SourceType } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const type = (searchParams.get('type') || 'kandilli') as SourceType;
  const location = searchParams.get('location');
  const size = searchParams.get('size');
  const sizeType = (searchParams.get('sizeType') || 'ml') as 'md' | 'ml' | 'mw';
  const isGreater = searchParams.get('isGreater') !== '0';
  const hour = searchParams.get('hour');
  
  try {
    const cacheKey = type;
    let earthquakes: Earthquake[] = getCache(cacheKey) || [];
    let fromCache = true;
    
    if (earthquakes.length === 0) {
      earthquakes = type === 'afad' ? await getAfadData() : await getKandilliData();
      setCache(cacheKey, earthquakes);
      fromCache = false;
    }
    
    if (location) {
      earthquakes = filterByLocation(earthquakes, location);
    }
    
    if (size) {
      const sizeNum = parseFloat(size);
      if (!isNaN(sizeNum)) {
        earthquakes = filterBySize(earthquakes, sizeNum, sizeType, isGreater);
      }
    }
    
    if (hour) {
      const hourNum = parseInt(hour);
      if (!isNaN(hourNum)) {
        earthquakes = filterByTime(earthquakes, hourNum, type);
      }
    }
    
    return NextResponse.json({
      earthquakes,
      source: type,
      cached: fromCache,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earthquake data' },
      { status: 500 }
    );
  }
}
