# SoundManager 使用方法

## 概要

SoundManager は、[snd-lib](https://github.com/snd-lib/snd-lib)を使用したグローバルサウンドマネージャーです。シングルトンパターンで実装されており、アプリケーション全体でサウンドを管理できます。

## 初期化

アプリケーションの起動時に自動的に初期化されます。`src/app/layout.tsx`で`SoundInitializer`コンポーネントが含まれているため、手動での初期化は不要です。

## 使用方法

### 1. 直接インポートして使用

```typescript
import { playButtonClick, playSuccess, playError } from "../lib/soundManager";

// ボタンクリック時
const handleClick = () => {
  playButtonClick();
  // その他の処理...
};

// 成功時
const handleSuccess = () => {
  playSuccess();
  // その他の処理...
};

// エラー時
const handleError = () => {
  playError();
  // その他の処理...
};
```

### 2. シングルトンインスタンスを直接使用

```typescript
import soundManager from "../lib/soundManager";

// カスタムサウンドを再生
soundManager.playCustomSound("notification");

// トグル音を再生
soundManager.playToggle(true); // ON
soundManager.playToggle(false); // OFF

// 遷移音を再生
soundManager.playTransition(true); // UP
soundManager.playTransition(false); // DOWN
```

## 利用可能なサウンド

### 基本的なサウンド

- `playButtonClick()` - ボタンクリック音
- `playSuccess()` - 成功音
- `playError()` - エラー音
- `playNotification()` - 通知音
- `playSelect()` - 選択音
- `playDisabled()` - 無効音

### インタラクション音

- `playToggle(isOn: boolean)` - トグル音（ON/OFF）
- `playTransition(isUp: boolean)` - 遷移音（UP/DOWN）
- `playType()` - タイプ音
- `playSwipe()` - スワイプ音

### ループ音

- `startProgressLoop()` - プログレスループ開始
- `stopProgressLoop()` - プログレスループ停止
- `startRingtoneLoop()` - 着信音ループ開始
- `stopRingtoneLoop()` - 着信音ループ停止

### 制御機能

- `stopAll()` - 全てのサウンドを停止
- `setVolume(volume: number)` - 音量設定（ログ出力のみ）
- `setMute(mute: boolean)` - ミュート設定（ログ出力のみ）
- `isSoundReady()` - 初期化状態確認

## 使用例

### React コンポーネントでの使用

```typescript
import { playButtonClick, playSuccess, playError } from "../lib/soundManager";

export default function MyComponent() {
  const handleSubmit = async () => {
    playButtonClick();

    try {
      // API呼び出しなど
      await submitData();
      playSuccess();
    } catch (error) {
      playError();
    }
  };

  return <button onClick={handleSubmit}>送信</button>;
}
```

### フォームでの使用

```typescript
import { playType, playSelect } from "../lib/soundManager";

export default function MyForm() {
  return (
    <form>
      <input
        type="text"
        onKeyDown={() => playType()}
        placeholder="タイプすると音が鳴ります"
      />

      <select onChange={() => playSelect()}>
        <option>選択肢1</option>
        <option>選択肢2</option>
      </select>
    </form>
  );
}
```

### トグルスイッチでの使用

```typescript
import { playToggle } from "../lib/soundManager";

export default function ToggleSwitch() {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    playToggle(newState);
  };

  return <button onClick={handleToggle}>{isOn ? "ON" : "OFF"}</button>;
}
```

## 注意事項

1. **ブラウザ制限**: 一部のブラウザでは、ユーザーインタラクション（クリックなど）がないとサウンドが再生されない場合があります。

2. **パフォーマンス**: サウンドファイルは初回読み込み時にダウンロードされます。

3. **エラーハンドリング**: サウンドの再生に失敗した場合、コンソールにエラーログが出力されます。

4. **音量制御**: 現在、音量とミュート機能はログ出力のみです。実際の制御が必要な場合は、snd-lib の機能を拡張する必要があります。

## 技術仕様

- **ライブラリ**: [snd-lib](https://github.com/snd-lib/snd-lib)
- **パターン**: シングルトン
- **初期化**: アプリケーション起動時
- **サウンドキット**: SND01
- **対応ブラウザ**: Web Audio API 対応ブラウザ
