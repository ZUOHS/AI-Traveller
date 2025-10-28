import { asyncHandler } from '../utils/asyncHandler.js';
import { searchPois, reverseGeocode } from '../services/mapService.js';

export const searchPoisController = asyncHandler(async (req, res) => {
  const { keywords, city } = req.query;
  const pois = await searchPois({ keywords, city });
  res.json({ data: pois });
});

export const reverseGeocodeController = asyncHandler(async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res
      .status(400)
      .json({ error: { message: '缺少 location 参数，例如 116.481488,39.990464' } });
  }
  const result = await reverseGeocode({ location });
  res.json({ data: result });
});
