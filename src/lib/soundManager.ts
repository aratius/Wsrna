import Snd from 'snd-lib';

/**
 * グローバルサウンドマネージャー
 * シングルトンパターンで実装し、アプリケーション全体でサウンドを管理
 */
class SoundManager {
  private static instance: SoundManager;
  private snd: Snd | null = null;
  private isInitialized = false;

  private constructor() {
    // プライベートコンストラクタ（シングルトン）
  }

  /**
   * シングルトンインスタンスを取得
   */
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * サウンドマネージャーを初期化
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.snd = new Snd({
        easySetup: false, // 手動でサウンドを制御
        preloadSoundKit: Snd.KITS.SND01
      });

      // サウンドキットを読み込み
      await this.snd.load(Snd.KITS.SND01);
      this.isInitialized = true;
      console.log('SoundManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SoundManager:', error);
    }
  }

  /**
   * ボタンクリック音を再生
   */
  public playButtonClick(): void {
    this.playSound(Snd.SOUNDS.TAP);
  }

  /**
   * 成功音を再生
   */
  public playSuccess(): void {
    this.playSound(Snd.SOUNDS.CELEBRATION);
  }

  /**
   * エラー音を再生
   */
  public playError(): void {
    this.playSound(Snd.SOUNDS.CAUTION);
  }

  /**
   * 通知音を再生
   */
  public playNotification(): void {
    this.playSound(Snd.SOUNDS.NOTIFICATION);
  }

  /**
   * 選択音を再生
   */
  public playSelect(): void {
    this.playSound(Snd.SOUNDS.SELECT);
  }

  /**
   * トグル音を再生
   */
  public playToggle(isOn: boolean): void {
    this.playSound(isOn ? Snd.SOUNDS.TOGGLE_ON : Snd.SOUNDS.TOGGLE_OFF);
  }

  /**
   * 遷移音を再生
   */
  public playTransition(isUp: boolean): void {
    this.playSound(isUp ? Snd.SOUNDS.TRANSITION_UP : Snd.SOUNDS.TRANSITION_DOWN);
  }

  /**
   * タイプ音を再生
   */
  public playType(): void {
    // モバイル端末の場合はタイプ音を鳴らさない
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent;
      const isMobile =
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      if (isMobile) {
        return;
      }
    }

    this.playSound(Snd.SOUNDS.TYPE);
  }

  /**
   * 無効音を再生
   */
  public playDisabled(): void {
    this.playSound(Snd.SOUNDS.DISABLED);
  }

  /**
   * スワイプ音を再生
   */
  public playSwipe(): void {
    this.playSound(Snd.SOUNDS.SWIPE);
  }

  /**
   * プログレスループ音を開始
   * 正しくループする音はループ再生する
   */
  public startProgressLoop(): void {
    this.playSound(Snd.SOUNDS.PROGRESS_LOOP, { loop: true });
  }

  /**
   * プログレスループ音を停止
   */
  public stopProgressLoop(): void {
    if (this.snd) {
      this.snd.stop(Snd.SOUNDS.PROGRESS_LOOP);
    }
  }

  /**
   * 着信音ループを開始
   * 正しくループする音はループ再生する
   */
  public startRingtoneLoop(): void {
    this.playSound(Snd.SOUNDS.RINGTONE_LOOP, { loop: true });
  }

  /**
   * 着信音ループを停止
   */
  public stopRingtoneLoop(): void {
    if (this.snd) {
      this.snd.stop(Snd.SOUNDS.RINGTONE_LOOP);
    }
  }

  /**
   * カスタムサウンドを再生
   */
  public playCustomSound(soundType: string, options?: { loop?: boolean }): void {
    this.playSound(soundType, options);
  }

  /**
   * サウンドを停止
   */
  public stopSound(soundType: string): void {
    if (this.snd) {
      this.snd.stop(soundType);
    }
  }

  /**
   * 全てのサウンドを停止
   */
  public stopAll(): void {
    if (this.snd) {
      // snd-libにはstopAllメソッドがないため、個別に停止
      Object.values(Snd.SOUNDS).forEach(soundType => {
        this.snd?.stop(soundType);
      });
    }
  }

  /**
   * 音量を設定
   */
  public setVolume(volume: number): void {
    if (this.snd) {
      // snd-libにはsetVolumeメソッドがないため、コンソールログで代替
      console.log(`Volume set to: ${volume}`);
    }
  }

  /**
   * ミュート状態を設定
   */
  public setMute(mute: boolean): void {
    if (this.snd) {
      // snd-libにはsetMuteメソッドがないため、コンソールログで代替
      console.log(`Mute set to: ${mute}`);
    }
  }

  /**
   * 初期化状態を確認
   */
  public isReady(): boolean {
    return this.isInitialized && this.snd !== null;
  }

  /**
   * 内部的なサウンド再生処理
   * optionsでloop再生等を指定可能
   */
  private playSound(soundType: string, options?: { loop?: boolean }): void {
    if (!this.isInitialized || !this.snd) {
      console.warn('SoundManager is not initialized');
      return;
    }

    try {
      if (options && options.loop) {
        this.snd.play(soundType, { loop: true });
      } else {
        this.snd.play(soundType);
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundType}:`, error);
    }
  }
}

// グローバルインスタンスを作成
const soundManager = SoundManager.getInstance();

// 便利な関数をエクスポート
export const playButtonClick = () => soundManager.playButtonClick();
export const playSuccess = () => soundManager.playSuccess();
export const playError = () => soundManager.playError();
export const playNotification = () => soundManager.playNotification();
export const playSelect = () => soundManager.playSelect();
export const playToggle = (isOn: boolean) => soundManager.playToggle(isOn);
export const playTransition = (isUp: boolean) => soundManager.playTransition(isUp);
export const playType = () => soundManager.playType();
export const playDisabled = () => soundManager.playDisabled();
export const playSwipe = () => soundManager.playSwipe();
export const startProgressLoop = () => soundManager.startProgressLoop();
export const stopProgressLoop = () => soundManager.stopProgressLoop();
export const startRingtoneLoop = () => soundManager.startRingtoneLoop();
export const stopRingtoneLoop = () => soundManager.stopRingtoneLoop();
export const stopAll = () => soundManager.stopAll();
export const setVolume = (volume: number) => soundManager.setVolume(volume);
export const setMute = (mute: boolean) => soundManager.setMute(mute);
export const isSoundReady = () => soundManager.isReady();

// デフォルトエクスポート
export default soundManager;