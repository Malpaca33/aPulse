import { useEffect, useRef } from 'react';
import { CITY_COORDS } from '../../lib/constants';
import type { Photo } from '../../hooks/usePhotos';

interface MapViewProps {
  photos: Photo[];
}

export function MapView({ photos }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;

    const cityData: Record<string, { count: number; imageUrls: string[] }> = {};
    for (const p of photos) {
      if (!p.city || !CITY_COORDS[p.city]) continue;
      if (!cityData[p.city]) cityData[p.city] = { count: 0, imageUrls: [] };
      cityData[p.city].count++;
      if (cityData[p.city].imageUrls.length < 6) {
        cityData[p.city].imageUrls.push(p.image_url);
      }
    }

    const cities = Object.keys(cityData);
    if (!cities.length) {
      mapRef.current.innerHTML = '<div class="flex h-full items-center justify-center"><p class="text-sm text-white/40">还没有标注坐标城市的照片。</p></div>';
      return;
    }

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      const el = mapRef.current;
      if (!el) return;

      const map = L.map(el, { zoomControl: false, attributionControl: false }).setView([35.86, 104.19], 4);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      const bounds: [number, number][] = [];
      for (const city of cities) {
        const coord = CITY_COORDS[city] as [number, number];
        bounds.push(coord);
        const count = cityData[city].count;
        const radius = Math.min(8 + count * 2, 24);

        L.circleMarker(coord, {
          radius,
          color: '#22d3ee',
          fillColor: '#22d3ee',
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(map)
          .bindTooltip(city, { direction: 'top', offset: [0, -radius], className: 'text-xs font-semibold text-white' })
          .bindPopup(`
            <div class="text-center" style="font-family:system-ui,sans-serif">
              <p style="font-weight:700;margin:0 0 4px;color:#fff">📍 ${city}</p>
              <p style="font-size:12px;color:#a1a1aa;margin:0 0 8px">${count} 张照片</p>
              <div style="display:flex;gap:4px;justify-content:center">${cityData[city].imageUrls.map(url => `<img src="${url}" class="h-12 w-12 rounded-lg object-cover" />`).join('')}</div>
            </div>
          `);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds as any, { padding: [50, 50] });
      } else {
        map.setView(bounds[0], 10);
      }
    };

    initMap();
  }, [photos]);

  return (
    <div id="map-container" className="h-[65vh] min-h-[400px] max-h-[700px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
      <div ref={mapRef} className="h-full w-full" />
    </div>
  );
}
