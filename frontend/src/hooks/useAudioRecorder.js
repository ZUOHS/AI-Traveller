import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { blobToWav } from '../utils/audio.js';

const chooseMimeType = () => {
  if (typeof window === 'undefined' || typeof window.MediaRecorder === 'undefined') {
    return null;
  }

  if (window.MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
    return 'audio/webm;codecs=opus';
  }
  if (window.MediaRecorder.isTypeSupported('audio/webm')) {
    return 'audio/webm';
  }
  if (window.MediaRecorder.isTypeSupported('audio/mp4')) {
    return 'audio/mp4';
  }
  return 'audio/wav';
};

export const useAudioRecorder = () => {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef('audio/webm');

  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  const supported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const mediaDevices = navigator?.mediaDevices;
    return Boolean(window.MediaRecorder && mediaDevices?.getUserMedia);
  }, []);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (!supported) {
      const err = new Error('当前浏览器不支持录音，请改用语音文件上传。');
      setError(err.message);
      throw err;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = chooseMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      mimeTypeRef.current = mimeType ?? 'audio/webm';
      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        const message = event.error?.message ?? '录音出现问题，请重试。';
        setError(message);
      };

      return await new Promise((resolve, reject) => {
        recorder.onstart = () => {
          setIsRecording(true);
          resolve();
        };

        recorder.onstop = async () => {
          setIsRecording(false);
          cleanupStream();
        };

        try {
          recorder.start();
        } catch (startError) {
          setError(startError.message ?? '无法开始录音');
          cleanupStream();
          reject(startError);
        }
      });
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'NotFoundError') {
        setError('无法访问麦克风，请检查浏览器权限。');
      } else {
        setError(err.message ?? '启动录音失败，请稍后再试。');
      }
      cleanupStream();
      throw err;
    }
  }, [cleanupStream, supported]);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (!recorder) {
      return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
      const finalize = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
          chunksRef.current = [];
          mediaRecorderRef.current = null;
          const wavBlob = await blobToWav(blob);
          resolve(wavBlob);
        } catch (conversionError) {
          setError(conversionError.message ?? '处理录音失败，请重试。');
          reject(conversionError);
        }
      };

      if (recorder.state === 'inactive') {
        finalize();
        return;
      }

      recorder.onstop = () => {
        setIsRecording(false);
        cleanupStream();
        finalize();
      };

      try {
        recorder.stop();
      } catch (stopError) {
        cleanupStream();
        setIsRecording(false);
        setError(stopError.message ?? '停止录音失败。');
        reject(stopError);
      }
    });
  }, [cleanupStream]);

  const cancel = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupStream();
    }
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setIsRecording(false);
  }, [cleanupStream]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    supported,
    isRecording,
    start,
    stop,
    cancel,
    error,
    resetError: () => setError(null)
  };
};
