import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { createServerError } from '../utils/apiError.js';

const IFLYTEK_HOST = 'iat.xf-yun.com';
const IFLYTEK_PATH = '/v1';
const FRAME_SIZE = 1280;
const STREAM_INTERVAL_MS = 40;

const buildSignedUrl = () => {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${IFLYTEK_HOST}\ndate: ${date}\nGET ${IFLYTEK_PATH} HTTP/1.1`;
  const signature = crypto.createHmac('sha256', env.iflytekApiSecret).update(signatureOrigin).digest('base64');
  const authorization = Buffer.from(
    `api_key="${env.iflytekApiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
  ).toString('base64');

  const query = new URLSearchParams({
    authorization,
    date,
    host: IFLYTEK_HOST
  });

  return `wss://${IFLYTEK_HOST}${IFLYTEK_PATH}?${query.toString()}`;
};

const normalizeAudioBuffer = (buffer, mimeType) => {
  if (mimeType?.includes('wav')) {
    if (buffer.length <= 44) {
      throw new Error('Invalid WAV audio payload');
    }

    const channels = buffer.readUInt16LE(22);
    const sampleRate = buffer.readUInt32LE(24);
    const bitDepth = buffer.readUInt16LE(34);

    return {
      buffer: buffer.subarray(44),
      encoding: 'raw',
      channels,
      sampleRate,
      bitDepth
    };
  }

  if (mimeType?.includes('mp3')) {
    return {
      buffer,
      encoding: 'lame'
    };
  }

  return {
    buffer,
    encoding: 'raw'
  };
};

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const buildFramePayload = (meta, status, seq, base64Chunk) => {
  const payload = {
    encoding: meta.encoding,
    seq,
    status,
    audio: base64Chunk
  };

  if (meta.sampleRate) {
    payload.sample_rate = meta.sampleRate;
  }
  if (meta.channels) {
    payload.channels = meta.channels;
  }
  if (meta.bitDepth) {
    payload.bit_depth = meta.bitDepth;
  }

  return payload;
};

const rebuildSequentialMap = (sourceMap) => {
  const orderedEntries = Array.from(sourceMap.entries()).sort((a, b) => a[0] - b[0]);
  sourceMap.clear();
  for (const [, value] of orderedEntries) {
    sourceMap.set(sourceMap.size, value);
  }
};

const mergeResultSegments = (segmentsMap, resultJson) => {
  if (!resultJson || !Array.isArray(resultJson.ws)) {
    return segmentsMap;
  }

  const text = resultJson.ws
    .map((item) => (item.cw ?? []).map((cw) => cw.w).join(''))
    .join('');

  if (!text) {
    return segmentsMap;
  }

  const currentText = Array.from(segmentsMap.values()).join('');

  if (resultJson.pgs === 'rpl' && Array.isArray(resultJson.rg) && resultJson.rg.length === 2) {
    const start = Number.isInteger(resultJson.rg[0]) ? resultJson.rg[0] : 0;
    const end = Number.isInteger(resultJson.rg[1]) ? resultJson.rg[1] : start;
    const safeStart = Math.max(0, start);
    const safeEnd = Math.max(safeStart, end);

    for (let index = safeStart; index <= safeEnd; index += 1) {
      segmentsMap.delete(index);
    }

    rebuildSequentialMap(segmentsMap);
    segmentsMap.set(segmentsMap.size, text);
    return segmentsMap;
  }

  if (currentText) {
    if (text.startsWith(currentText)) {
      segmentsMap.clear();
      segmentsMap.set(0, text);
      return segmentsMap;
    }

    if (currentText.endsWith(text) || currentText.includes(text)) {
      return segmentsMap;
    }
  }

  segmentsMap.set(segmentsMap.size, text);
  return segmentsMap;
};

const callIflytek = async (buffer, mimeType) => {
  const audioMeta = normalizeAudioBuffer(buffer, mimeType);
  const url = buildSignedUrl();
  const resultSegments = new Map();
  let resolved = false;
  let websocket;

  const finalize = (resolve, reject) => (error, data) => {
    if (resolved) return;
    resolved = true;

    try {
      if (
        websocket &&
        (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING)
      ) {
        websocket.close();
      }
    } catch (_) {
      // ignore close errors
    }

    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  };

  return new Promise((resolve, reject) => {
    const done = finalize(resolve, reject);

    try {
      websocket = new WebSocket(url);
    } catch (error) {
      done(error);
      return;
    }

    websocket.onerror = (event) => {
      const error =
        event?.error instanceof Error ? event.error : new Error('iFlytek websocket connection error');
      done(error);
    };

    websocket.onclose = (event) => {
      if (!resolved) {
        done(new Error(`iFlytek websocket closed unexpectedly (code: ${event.code ?? 'unknown'})`));
      }
    };

    websocket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const code = payload?.header?.code;

        if (code !== 0) {
          const errorMessage = payload?.header?.message ?? 'iFlytek recognizer error';
          const error = new Error(errorMessage);
          error.code = code;
          done(error);
          return;
        }

        const result = payload?.payload?.result;

        if (result?.text) {
          const decoded = Buffer.from(result.text, 'base64').toString('utf8');
          const json = JSON.parse(decoded);
          mergeResultSegments(resultSegments, json);
        }

        if (result?.status === 2) {
          const finalText = Array.from(resultSegments.values()).join('').trim();
          done(null, finalText);
        }
      } catch (error) {
        done(error);
      }
    };

    websocket.onopen = async () => {
      const audioBuffer = audioMeta.buffer;
      const chunks = [];

      for (let offset = 0; offset < audioBuffer.length; offset += FRAME_SIZE) {
        chunks.push(audioBuffer.subarray(offset, offset + FRAME_SIZE));
      }

      if (chunks.length === 0) {
        chunks.push(Buffer.alloc(0));
      }

      let seq = 0;

      try {
        for (let index = 0; index < chunks.length; index += 1) {
          const chunk = chunks[index];
          const status = index === 0 ? 0 : 1;
          const frame = {
            header: {
              app_id: env.iflytekAppId,
              status
            },
            payload: {
              audio: buildFramePayload(
                audioMeta,
                status,
                seq,
                chunk.length > 0 ? chunk.toString('base64') : ''
              )
            }
          };

          if (status === 0) {
            frame.parameter = {
              iat: {
                domain: 'slm',
                language: 'zh_cn',
                accent: 'mandarin',
                dwa: 'wpgs',
                result: {
                  encoding: 'utf8',
                  compress: 'raw',
                  format: 'json'
                }
              }
            };
          }

          websocket.send(JSON.stringify(frame));
          seq += 1;
          await delay(STREAM_INTERVAL_MS);
        }

        const finalFrame = {
          header: {
            app_id: env.iflytekAppId,
            status: 2
          },
          payload: {
            audio: buildFramePayload(audioMeta, 2, seq, '')
          }
        };

        websocket.send(JSON.stringify(finalFrame));
      } catch (error) {
        done(error);
      }
    };
  });
};

export const transcribeSpeech = async (buffer, mimeType) => {
  if (env.iflytekAppId && env.iflytekApiKey && env.iflytekApiSecret) {
    try {
      return await callIflytek(buffer, mimeType);
    } catch (error) {
      logger.error('iFlytek transcription failed', {
        error: error.message,
        code: error.code
      });
      throw createServerError('语音识别失败，请稍后重试。');
    }
  }

  logger.warn('iFlytek credentials missing, returning placeholder transcript.');
  return '请在设置中配置科大讯飞语音识别密钥后重新尝试。';
};
