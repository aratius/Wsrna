import { useState, useEffect } from 'react';
import { startProgressLoop, stopProgressLoop } from '../lib/soundManager';

interface UseLoadingOptions {
  enableSound?: boolean;
  autoStopAfter?: number; // 自動停止までの時間（ミリ秒）
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { enableSound = true, autoStopAfter } = options;
  const [isLoading, setIsLoading] = useState(false);

  // ローディング開始
  const startLoading = () => {
    setIsLoading(true);
    if (enableSound) {
      startProgressLoop();
    }
  };

  // ローディング停止
  const stopLoading = () => {
    setIsLoading(false);
    if (enableSound) {
      stopProgressLoop();
    }
  };

  // ローディング状態をトグル
  const toggleLoading = () => {
    if (isLoading) {
      stopLoading();
    } else {
      startLoading();
    }
  };

  // 非同期処理をラップする関数
  const withLoading = async <T>(asyncFn: () => Promise<T>): Promise<T> => {
    try {
      startLoading();
      const result = await asyncFn();
      return result;
    } finally {
      stopLoading();
    }
  };

  // 自動停止機能
  useEffect(() => {
    if (isLoading && autoStopAfter) {
      const timer = setTimeout(() => {
        stopLoading();
      }, autoStopAfter);

      return () => clearTimeout(timer);
    }
  }, [isLoading, autoStopAfter]);

  // コンポーネントがアンマウントされる時にProgress音を停止
  useEffect(() => {
    return () => {
      if (enableSound) {
        stopProgressLoop();
      }
    };
  }, [enableSound]);

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
  };
}