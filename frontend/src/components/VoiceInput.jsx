import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAudioRecorder } from '../hooks/useAudioRecorder.js';
import { transcribeAudioFile } from '../services/speechService.js';

export function VoiceInput({
  onTranscript,
  placeholder = '点击开始录音，由科大讯飞识别返回文字',
  buttonLabel = '开始录音',
  recordingLabel = '结束录音',
  variant = 'default',
  className = '',
  buttonClassName = '',
  onStatusChange,
  onError,
  disabled = false
}) {
  const { supported, isRecording, start, stop, error, resetError } = useAudioRecorder();
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  useEffect(() => {
    if (statusMessage && onStatusChange) {
      onStatusChange(statusMessage);
    }
  }, [statusMessage, onStatusChange]);

  useEffect(() => {
    if (errorMessage && onError) {
      onError(errorMessage);
    }
  }, [errorMessage, onError]);

  const resetState = useCallback(() => {
    setStatusMessage('');
    setErrorMessage('');
    resetError();
  }, [resetError]);

  const handleStart = useCallback(async () => {
    if (!supported) {
      const message = '当前浏览器不支持录音，请改用其他方式。';
      setErrorMessage(message);
      onError?.(message);
      return;
    }

    try {
      resetState();
      await start();
      const message = '正在录音，再次点击按钮结束录音并开始识别。';
      setStatusMessage(message);
      onStatusChange?.(message);
    } catch (err) {
      const message =
        err?.name === 'NotAllowedError'
          ? '已拒绝麦克风权限，请在浏览器设置中允许访问。'
          : err?.message ?? '无法开始录音，请检查设备后重试。';
      setErrorMessage(message);
      onError?.(message);
    }
  }, [onError, onStatusChange, resetState, start, supported]);

  const handleStop = useCallback(async () => {
    try {
      setProcessing(true);
      const blob = await stop();
      if (!blob) {
        const message = '录音数据为空，请重试。';
        setErrorMessage(message);
        onError?.(message);
        return;
      }
      const file = new File([blob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });
      const text = await transcribeAudioFile(file);
      const message = '识别成功，已填入文本。';
      setStatusMessage(message);
      onStatusChange?.(message);
      onTranscript?.(text);
    } catch (err) {
      const message =
        err?.response?.data?.error?.message ?? err?.message ?? '识别失败，请稍后重试。';
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setProcessing(false);
    }
  }, [onError, onStatusChange, onTranscript, stop]);

  const handleClick = useCallback(async () => {
    if (processing || disabled) return;
    if (!isRecording) {
      await handleStart();
      return;
    }
    await handleStop();
  }, [disabled, handleStart, handleStop, isRecording, processing]);

  const helper = useMemo(() => {
    if (!supported) {
      return {
        text: '当前浏览器不支持录音，请使用文字输入。',
        className: 'text-rose-500'
      };
    }

    if (errorMessage) {
      return { text: errorMessage, className: 'text-rose-500' };
    }

    if (processing) {
      return { text: '音频上传中，请稍候…', className: 'text-primary animate-pulse' };
    }

    if (isRecording) {
      return { text: '正在录音，再次点击按钮结束录音并开始识别。', className: 'text-primary' };
    }

    if (statusMessage) {
      return { text: statusMessage, className: 'text-slate-500' };
    }

    return { text: placeholder, className: 'text-slate-400' };
  }, [errorMessage, isRecording, placeholder, processing, statusMessage, supported]);

  const buttonText = useMemo(() => {
    if (processing) return '处理中…';
    return isRecording ? recordingLabel : buttonLabel;
  }, [buttonLabel, isRecording, processing, recordingLabel]);

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={processing || disabled}
        className={`rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary shadow-sm transition enabled:hover:bg-primary enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`.trim()}
      >
        {buttonText}
      </button>
    );
  }

  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={processing || disabled}
          className={`rounded-md border border-primary px-3 py-1.5 text-sm font-medium text-primary shadow-sm transition enabled:hover:bg-primary enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`.trim()}
        >
          {buttonText}
        </button>
      </div>
      <p className={`text-xs ${helper.className}`}>{helper.text}</p>
    </div>
  );
}
