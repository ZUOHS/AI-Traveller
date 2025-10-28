const mixToMono = (audioBuffer) => {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const length = audioBuffer.length;
  const mixed = new Float32Array(length);

  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      mixed[i] += channelData[i];
    }
  }

  for (let i = 0; i < length; i += 1) {
    mixed[i] /= audioBuffer.numberOfChannels;
  }

  return mixed;
};

const resample = (data, originalSampleRate, targetSampleRate) => {
  if (originalSampleRate === targetSampleRate) {
    return data;
  }

  const ratio = originalSampleRate / targetSampleRate;
  const newLength = Math.round(data.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i += 1) {
    const origin = i * ratio;
    const lower = Math.floor(origin);
    const upper = Math.min(lower + 1, data.length - 1);
    const interpolation = origin - lower;
    const lowerSample = data[lower];
    const upperSample = data[upper];
    result[i] = lowerSample + (upperSample - lowerSample) * interpolation;
  }

  return result;
};

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

const floatTo16BitPCM = (view, offset, input) => {
  for (let i = 0; i < input.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
};

const encodeWavBuffer = (samples, sampleRate) => {
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * bytesPerSample, true);

  floatTo16BitPCM(view, 44, samples);

  return buffer;
};

export const audioBufferToWav = (audioBuffer, targetSampleRate = 16000) => {
  const monoData = mixToMono(audioBuffer);
  const resampled = resample(monoData, audioBuffer.sampleRate, targetSampleRate);
  return encodeWavBuffer(resampled, targetSampleRate);
};

export const blobToWav = async (blob, targetSampleRate = 16000) => {
  if (blob.type.includes('wav')) {
    return blob;
  }

  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ||
    null;

  if (!AudioCtx) {
    throw new Error('当前环境不支持音频解码，请使用语音文件上传。');
  }

  const audioContext = new AudioCtx();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const wavBuffer = audioBufferToWav(audioBuffer, targetSampleRate);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  } finally {
    await audioContext.close();
  }
};
