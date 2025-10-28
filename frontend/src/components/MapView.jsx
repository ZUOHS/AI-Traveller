import { useEffect, useMemo, useRef, useState } from 'react';

import { appConfig } from '../lib/config.js';
import { searchPois } from '../services/mapService.js';

const loadAmap = (() => {
  let promise = null;
  return () => {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    if (window.AMap) {
      return Promise.resolve(window.AMap);
    }
    if (!promise) {
      promise = new Promise((resolve, reject) => {
        if (appConfig.amapJsSecurityCode) {
          window._AMapSecurityConfig = {
            ...(window._AMapSecurityConfig || {}),
            securityJsCode: appConfig.amapJsSecurityCode
          };
        }
        const script = document.createElement('script');
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${appConfig.amapJsKey}&plugin=AMap.ToolBar,AMap.Scale`;
        script.async = true;
        script.onload = () => resolve(window.AMap);
        script.onerror = (error) => reject(error);
        document.body.appendChild(script);
      });
    }
    return promise;
  };
})();

const mapFallback = (items) => (
  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
    <div>
      <p>尚未配置高德 JS Key，暂无法渲染地图。</p>
      <p className="mt-2">以下为行程地点列表，可参考手动查看：</p>
      <ul className="mt-1 list-disc pl-5 text-left">
        {items.slice(0, 5).map((item, index) => (
          <li key={`${item.title}-${index}`}>{item.location}</li>
        ))}
      </ul>
    </div>
  </div>
);

export function MapView({ itinerary, destination }) {
  const containerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState(null);
  const [resolvedSpots, setResolvedSpots] = useState([]);

  const baseSpots = useMemo(() => {
    if (!itinerary?.days) return [];
    return itinerary.days.flatMap((day) => day.items || []);
  }, [itinerary]);

  useEffect(() => {
    setResolvedSpots(baseSpots);
  }, [baseSpots]);

  useEffect(() => {
    if (!baseSpots.length || !appConfig.amapJsKey) {
      return;
    }

    let cancelled = false;
    const cache = new Map();

    const enrichSpots = async () => {
      const enriched = await Promise.all(
        baseSpots.map(async (item) => {
          if ((item.lat && item.lng) || !item.location) {
            return item;
          }
          const cacheKey = `${destination ?? ''}:${item.location}`;
          if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            return cached ? { ...item, ...cached } : item;
          }
          try {
            const [poi] = await searchPois({
              keywords: item.location,
              city: destination
            });
            if (poi?.lat && poi?.lng) {
              const coords = {
                lat: Number(poi.lat),
                lng: Number(poi.lng)
              };
              cache.set(cacheKey, coords);
              return { ...item, ...coords };
            }
          } catch (fetchError) {
            console.warn('无法解析地点坐标', fetchError);
          }
          cache.set(cacheKey, null);
          return item;
        })
      );
      if (!cancelled) {
        setResolvedSpots(enriched);
      }
    };

    enrichSpots();

    return () => {
      cancelled = true;
    };
  }, [baseSpots, destination]);

  useEffect(() => {
    if (!appConfig.amapJsKey || !resolvedSpots.length) {
      return;
    }

    let mapInstance = null;
    let markers = [];

    loadAmap()
      .then((AMap) => {
        if (!containerRef.current) return;

        mapInstance = new AMap.Map(containerRef.current, {
          zoom: 11,
          viewMode: '3D'
        });
        mapInstance.addControl(new AMap.ToolBar());
        mapInstance.addControl(new AMap.Scale());

        markers = resolvedSpots
          .filter((item) => item.lat && item.lng)
          .map((item) => {
            const marker = new AMap.Marker({
              position: [item.lng, item.lat],
              title: item.title
            });
            marker.setLabel({
              direction: 'top',
              offset: [0, -10],
              content: `<span style="background:#2563eb;padding:2px 6px;border-radius:12px;color:white;font-size:12px;">${item.title}</span>`
            });
            return marker;
          });

        if (markers.length) {
          mapInstance.add(markers);
          const bounds = new AMap.Bounds();
          markers.forEach((marker) => bounds.extend(marker.getPosition()));
          mapInstance.setFitView();
        }
        setMapReady(true);
      })
      .catch((loadError) => {
        setError(loadError);
      });

    return () => {
      markers.forEach((marker) => marker?.setMap(null));
      if (mapInstance) {
        mapInstance?.destroy();
      }
    };
  }, [resolvedSpots]);

  if (!baseSpots.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        生成行程后可查看地图路线。
      </div>
    );
  }

  if (!appConfig.amapJsKey) {
    return mapFallback(baseSpots);
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-500">
        地图加载失败：{error.message}
      </div>
    );
  }

  const visibleMarkers = resolvedSpots.filter((item) => item.lat && item.lng);

  return (
    <div className="h-96">
      <div ref={containerRef} className="h-full w-full rounded-xl" />
      {!mapReady ? (
        <p className="mt-2 text-xs text-slate-400">地图加载中…</p>
      ) : null}
      {mapReady && !visibleMarkers.length ? (
        <p className="mt-2 text-xs text-slate-500">
          未找到精确坐标，建议在行程项中补充更详细的地点名称。
        </p>
      ) : null}
    </div>
  );
}
