import axios from 'axios';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const AMAP_BASE = 'https://restapi.amap.com/v5';

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
  if (!ensureKey()) {
    return [
      {
        name: keywords ?? 'Sample Location',
        address: city ?? 'Sample Address',
        location: '116.397128,39.916527',
        type: 'Point of Interest',
        lat: 39.916527,
        lng: 116.397128
      }
    ];
  }

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

  return (response.data.pois ?? []).map((poi) => {
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
