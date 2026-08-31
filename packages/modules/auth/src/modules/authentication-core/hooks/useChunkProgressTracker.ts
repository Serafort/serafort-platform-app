import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseChunkProgressTrackerOptions {
  totalChunks?: number;
  chunkSize?: number;
  bytesPerChunk?: number;
  updateIntervalMs?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export interface ChunkProgressState {
  progress: number;
  processedChunks: number;
  totalChunks: number;
  processedItems: number;
  totalItems: number;
  itemsPerSecond: number;
  processedBytes: number;
  totalBytes: number;
  processedBytesFormatted: string;
  totalBytesFormatted: string;
  etaSeconds: number;
  etaFormatted: string;
  isProcessing: boolean;
  isComplete: boolean;
  start: (options?: { totalChunks?: number; chunkSize?: number; bytesPerChunk?: number }) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  finish: () => void;
  stepChunk: (count?: number) => void;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds < 60) return `~${Math.ceil(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.ceil(seconds % 60);
  return `~${mins}m ${secs}s`;
}

export function useChunkProgressTracker(
  options: UseChunkProgressTrackerOptions = {}
): ChunkProgressState {
  const {
    totalChunks: initialTotalChunks = 50,
    chunkSize: initialChunkSize = 100,
    bytesPerChunk: initialBytesPerChunk = 64 * 1024,
    updateIntervalMs = 150,
    autoStart = false,
    onComplete,
  } = options;

  const [totalChunks, setTotalChunks] = useState(initialTotalChunks);
  const [chunkSize, setChunkSize] = useState(initialChunkSize);
  const [bytesPerChunk, setBytesPerChunk] = useState(initialBytesPerChunk);

  const [processedChunks, setProcessedChunks] = useState(0);
  const [isProcessing, setIsProcessing] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setProcessedChunks(0);
    setIsProcessing(false);
    setIsComplete(false);
    startTimeRef.current = null;
  }, [clearTimer]);

  const finish = useCallback(() => {
    clearTimer();
    setProcessedChunks(totalChunks);
    setIsProcessing(false);
    setIsComplete(true);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, [clearTimer, totalChunks]);

  const stepChunk = useCallback(
    (count = 1) => {
      setProcessedChunks((prev) => {
        const next = Math.min(totalChunks, prev + count);
        if (next >= totalChunks) {
          setIsProcessing(false);
          setIsComplete(true);
          clearTimer();
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
        }
        return next;
      });
    },
    [totalChunks, clearTimer]
  );

  const start = useCallback(
    (customOptions?: { totalChunks?: number; chunkSize?: number; bytesPerChunk?: number }) => {
      clearTimer();
      const resolvedTotal = customOptions?.totalChunks ?? totalChunks;
      if (customOptions?.totalChunks) setTotalChunks(customOptions.totalChunks);
      if (customOptions?.chunkSize) setChunkSize(customOptions.chunkSize);
      if (customOptions?.bytesPerChunk) setBytesPerChunk(customOptions.bytesPerChunk);

      setProcessedChunks(0);
      setIsComplete(false);
      setIsProcessing(true);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setProcessedChunks((prev) => {
          if (prev >= resolvedTotal - 1) {
            return Math.min(resolvedTotal - 1, prev);
          }
          const increment = Math.max(1, Math.floor(Math.random() * 2) + 1);
          const next = Math.min(resolvedTotal - 1, prev + increment);
          return next;
        });
      }, updateIntervalMs);
    },
    [clearTimer, totalChunks, updateIntervalMs]
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsProcessing(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (isComplete || processedChunks >= totalChunks) return;
    setIsProcessing(true);
    timerRef.current = setInterval(() => {
      setProcessedChunks((prev) => {
        if (prev >= totalChunks - 1) {
          return Math.min(totalChunks - 1, prev);
        }
        const increment = Math.max(1, Math.floor(Math.random() * 2) + 1);
        return Math.min(totalChunks - 1, prev + increment);
      });
    }, updateIntervalMs);
  }, [isComplete, processedChunks, totalChunks, updateIntervalMs]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => clearTimer();
  }, [autoStart, start, clearTimer]);

  // Computed metrics
  const progress = totalChunks > 0 ? Math.min(100, Math.round((processedChunks / totalChunks) * 100)) : 0;
  const totalItems = totalChunks * chunkSize;
  const processedItems = processedChunks * chunkSize;
  const totalBytes = totalChunks * bytesPerChunk;
  const processedBytes = processedChunks * bytesPerChunk;

  const elapsedTimeSeconds = startTimeRef.current
    ? (Date.now() - startTimeRef.current) / 1000
    : 0;

  const itemsPerSecond =
    elapsedTimeSeconds > 0 && processedItems > 0
      ? Math.round(processedItems / elapsedTimeSeconds)
      : Math.round(chunkSize * (1000 / updateIntervalMs));

  const remainingItems = Math.max(0, totalItems - processedItems);
  const etaSeconds = itemsPerSecond > 0 ? remainingItems / itemsPerSecond : 0;

  return {
    progress,
    processedChunks,
    totalChunks,
    processedItems,
    totalItems,
    itemsPerSecond,
    processedBytes,
    totalBytes,
    processedBytesFormatted: formatBytes(processedBytes),
    totalBytesFormatted: formatBytes(totalBytes),
    etaSeconds,
    etaFormatted: formatEta(etaSeconds),
    isProcessing,
    isComplete,
    start,
    pause,
    resume,
    reset,
    finish,
    stepChunk,
  };
}

export default useChunkProgressTracker;
