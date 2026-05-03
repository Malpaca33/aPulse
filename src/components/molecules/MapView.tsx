import { useEffect, useRef, useId } from 'react';
import { CITY_COORDS } from '../../lib/constants';
import type { Photo } from '../../hooks/usePhotos';

interface MapViewProps {
  photos: Photo[];
}

export function MapView({ photos }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    const el = mapElRef.current;
    if (!el || containerRef.current?.dataset['map'] === uid) return;
    containerRef.current!.dataset['map'] = uid;

    const cityData: Record<string, { count: number; imageUrls: string[]; items: Photo[] }> = {};
    for (const p of photos) {
      if (!p.city || !CITY_COORDS[p.city]) continue;
      if (!cityData[p.city]) cityData[p.city] = { count: 0, imageUrls: [], items: [] };
      cityData[p.city].count++;
      cityData[p.city].items.push(p);
      if (cityData[p.city].imageUrls.length < 8) {
        cityData[p.city].imageUrls.push(p.image_url);
      }
    }

    const cities = Object.keys(cityData);
    if (!cities.length) {
      el.innerHTML = '<div class="flex h-full items-center justify-center"><p class="text-sm text-white/40">还没有标注坐标城市的照片。</p></div>';
      return;
    }

    let destroyed = false;

    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet.markercluster');
      if (destroyed || !el) return;

      const map = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
      }).setView([35.86, 104.19], 4);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

      // Clustered layer
      const mcg = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          const size = count < 10 ? 'sm' : count < 50 ? 'md' : 'lg';
          const colors: Record<string, string> = {
            sm: 'border-cyan-400/60 bg-cyan-500/15 text-cyan-300',
            md: 'border-cyan-400/80 bg-cyan-500/25 text-cyan-200',
            lg: 'border-cyan-400 bg-cyan-500/35 text-cyan-100',
          };
          return L.divIcon({
            html: `<div class="cluster-icon ${colors[size]}">${count}</div>`,
            className: 'cluster-icon-wrapper',
            iconSize: L.point(44, 44),
          });
        },
      });

      // Cluster CSS
      const styleId = 'mc-style-' + uid.replace(/[^a-zA-Z0-9]/g, '');
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .cluster-icon-wrapper { background: none !important; border: none !important; }
          .cluster-icon {
            width: 44px; height: 44px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 700;
            border: 2px solid; backdrop-filter: blur(4px);
            box-shadow: 0 2px 12px rgba(0,0,0,0.4);
            transition: transform 0.2s ease;
          }
          .cluster-icon:hover { transform: scale(1.1); }
        `;
        document.head.appendChild(style);
      }

      const bounds: [number, number][] = [];
      for (const city of cities) {
        const coord = CITY_COORDS[city] as [number, number];
        bounds.push(coord);
        const data = cityData[city];

        const marker = L.circleMarker(coord, {
          radius: 7,
          color: '#22d3ee',
          fillColor: '#22d3ee',
          fillOpacity: 0.25,
          weight: 2,
        });

        marker.bindTooltip(city, {
          direction: 'top',
          offset: [0, -10],
          className: 'text-xs font-semibold text-white/90',
        });

        // Popup with photo thumbnails
        const thumbRows: string[] = [];
        for (let i = 0; i < data.items.length; i += 4) {
          const row = data.items.slice(i, i + 4);
          thumbRows.push(
            '<div style="display:flex;gap:6px;margin-bottom:6px">' +
            row.map(p =>
              `<a href="/tweet/${p.id}" target="_blank" style="display:block;width:72px;height:72px;border-radius:10px;overflow:hidden;transition:transform .2s" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <img src="${p.image_url}" alt="" style="width:100%;height:100%;object-fit:cover" loading="lazy" />
              </a>`
            ).join('') +
            '</div>'
          );
        }

        const popupHtml = `
          <div style="font-family:system-ui,sans-serif;min-width:200px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-weight:700;font-size:14px;color:#fff">📍 ${city}</span>
              <span style="font-size:12px;color:#a1a1aa">${data.count} 张</span>
            </div>
            ${thumbRows.join('')}
            <a href="/photos" style="display:block;text-align:center;font-size:12px;color:#22d3ee;margin-top:4px;text-decoration:none">查看全部 &rarr;</a>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          maxWidth: 340,
          className: 'glass-popup',
          closeButton: true,
        });

        mcg.addLayer(marker);
      }

      map.addLayer(mcg);

      if (bounds.length > 1) {
        map.fitBounds(bounds as any, { padding: [50, 50], maxZoom: 12 });
      } else {
        map.setView(bounds[0], 10);
      }

      // Glass popup styles
      const popupStyleId = 'gp-style-' + uid.replace(/[^a-zA-Z0-9]/g, '');
      if (!document.getElementById(popupStyleId)) {
        const s = document.createElement('style');
        s.id = popupStyleId;
        s.textContent = `
          .glass-popup .leaflet-popup-content-wrapper {
            background: rgba(12,12,14,0.75) !important;
            backdrop-filter: blur(16px) !important;
            -webkit-backdrop-filter: blur(16px) !important;
            border-radius: 16px !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
            color: #fff !important;
            padding: 4px !important;
          }
          .glass-popup .leaflet-popup-tip {
            background: rgba(12,12,14,0.85) !important;
            backdrop-filter: blur(16px) !important;
          }
          .glass-popup .leaflet-popup-close-button {
            color: rgba(255,255,255,0.5) !important;
            right: 6px !important;
            top: 6px !important;
            font-size: 18px !important;
          }
          .glass-popup .leaflet-popup-close-button:hover {
            color: #fff !important;
          }
          .leaflet-tooltip {
            background: rgba(12,12,14,0.7) !important;
            backdrop-filter: blur(8px) !important;
            border: 1px solid rgba(255,255,255,0.08) !important;
            border-radius: 8px !important;
            color: #fff !important;
            padding: 4px 10px !important;
            font-size: 12px !important;
          }
          .leaflet-tooltip-top:before {
            border-top-color: rgba(12,12,14,0.7) !important;
          }
        `;
        document.head.appendChild(s);
      }
    })();

    return () => {
      destroyed = true;
    };
  }, [photos, uid]);

  return (
    <div ref={containerRef} className="h-[65vh] min-h-[400px] max-h-[700px] overflow-hidden [&_.rounded-2xl]:!rounded-2xl">
      <div
        ref={mapElRef}
        className="h-full w-full rounded-2xl border border-glass-border/60"
      />
    </div>
  );
}
