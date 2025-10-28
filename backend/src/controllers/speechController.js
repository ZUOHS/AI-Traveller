import { asyncHandler } from '../utils/asyncHandler.js';
import { transcribeSpeech } from '../services/speechService.js';

export const recognizeSpeechController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: { message: '缺少音频文件' } });
  }
  const transcript = await transcribeSpeech(req.file.buffer, req.file.mimetype);
  res.json({ data: { transcript } });
});
