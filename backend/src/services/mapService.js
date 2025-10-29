import axios from 'axios';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const AMAP_BASE = 'https://restapi.amap.com/v5';
const poiCache = new Map();
const quotaWarningKeys = new Set();

const parseLocation = (location) => {
  if (!location) {
    return { lat: null, lng: null };
  }
  const [lng, lat] = location.split(',').map(Number);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return { lat: null, lng: null };
  }
  return { lat, lng };
};

const ensureKey = () => {
  if (!env.amapWebServiceKey) {
    logger.warn('Gaode (Amap) API key missing, returning static results.');
    return false;
  }
  return true;
};

export const searchPois = async ({ keywords, city, pageSize = 10 }) => {
  const cacheKey = JSON.stringify([keywords ?? '', city ?? '', pageSize]);
  if (poiCache.has(cacheKey)) {
    return poiCache.get(cacheKey);
  }

  if (!ensureKey()) {
    const fallback = [
      {
        name: keywords ?? 'Sample Location',
        address: city ?? 'Sample Address',
        location: '116.397128,39.916527',
        type: 'Point of Interest',
        lat: 39.916527,
        lng: 116.397128
      }
    ];
    poiCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const response = await axios.get(`${AMAP_BASE}/place/text`, {
      params: {
        key: env.amapWebServiceKey,
        keywords,
        city,
        page_size: pageSize,
        page_index: 1
      }
    });

    if (response.data?.status !== '1') {
      throw new Error(response.data?.info ?? 'Gaode API error');
    }

    const mapped = (response.data.pois ?? []).map((poi) => {
      const coords = parseLocation(poi.location);
      return {
        id: poi.id,
        name: poi.name,
        address: poi.address,
        location: poi.location,
        type: poi.type,
        city: poi.cityname,
        tel: poi.tel,
        ...coords
      };
    });

    poiCache.set(cacheKey, mapped);
    return mapped;
  } catch (error) {
    const info = error?.response?.data?.info ?? error?.message ?? 'Gaode API request failed';
    const isQuotaExceeded =
      typeof info === 'string' && info.includes('CUQPS_HAS_EXCEEDED_THE_LIMIT');

    const warningKey = `${isQuotaExceeded ? 'quota' : 'error'}:${info}`;
    if (!quotaWarningKeys.has(warningKey)) {
      quotaWarningKeys.add(warningKey);
      logger.warn(
        isQuotaExceeded
          ? 'Gaode POI quota exceeded, using fallback data.'
          : 'Gaode POI search failed, using fallback data.',
        {
          keywords,
          city,
          info
        }
      );
    }

    const fallback =
      poiCache.get(cacheKey) ?? [
        {
          id: `fallback-${keywords ?? 'poi'}`,
          name: keywords ?? 'Popular spot',
          address: city ?? 'Unknown address',
          location: '116.397128,39.916527',
          type: 'Point of Interest',
          city: city ?? '',
          tel: '',
          lat: 39.916527,
          lng: 116.397128,
          note: 'Fallback result due to Gaode quota limit'
        }
      ];

    poiCache.set(cacheKey, fallback);
    return fallback;
  }
};

export const reverseGeocode = async ({ location }) => {
  if (!ensureKey()) {
    return {
      formattedAddress: 'Sample Address',
      district: 'Sample District',
      street: 'Sample Street'
    };
  }

  const response = await axios.get(`${AMAP_BASE}/geocode/regeo`, {
    params: {
      key: env.amapWebServiceKey,
      location
    }
  });

  if (response.data?.status !== '1') {
    throw new Error(response.data?.info ?? 'Gaode reverse geocode error');
  }

  const regeocode = response.data.regeocode;
  return {
    formattedAddress: regeocode.formatted_address,
    district: regeocode.addressComponent?.district,
    street: regeocode.addressComponent?.township
  };
};

