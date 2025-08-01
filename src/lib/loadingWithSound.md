# LoadingWithSound 使用方法

## 概要

LoadingWithSound は、ローディング表示時に SND Progress 音を自動再生するコンポーネントです。ローディング開始時に Progress 音を開始し、ローディング終了時に自動停止します。

## 基本的な使用方法

### 1. 直接使用

```typescript
import LoadingWithSound from '@/components/LoadingWithSound';

// 基本的な使用
<LoadingWithSound />

// カスタマイズ
<LoadingWithSound
  message="データを読み込み中..."
  subMessage="しばらくお待ちください"
  spinnerColor="#ff6b6b"
  spinnerSize={32}
  enableSound={true}
  show={true}
/>
```

### 2. 条件付き表示

```typescript
import LoadingWithSound from "@/components/LoadingWithSound";

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div>
      <LoadingWithSound show={isLoading} />
      {/* 他のコンテンツ */}
    </div>
  );
}
```

## カスタムフックの使用

### useLoading フック

```typescript
import { useLoading } from "@/hooks/useLoading";

function MyComponent() {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading({
    enableSound: true,
    autoStopAfter: 10000, // 10秒後に自動停止
  });

  // 手動でローディング制御
  const handleManualLoading = async () => {
    startLoading();
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };

  // 非同期処理をラップ
  const handleWrappedLoading = async () => {
    const result = await withLoading(async () => {
      return await someAsyncOperation();
    });
    console.log(result);
  };

  return (
    <div>
      <LoadingWithSound show={isLoading} />
      <button onClick={handleManualLoading}>手動ローディング</button>
      <button onClick={handleWrappedLoading}>ラップローディング</button>
    </div>
  );
}
```

## プロパティ

### LoadingWithSoundProps

| プロパティ     | 型        | デフォルト     | 説明                |
| -------------- | --------- | -------------- | ------------------- |
| `message`      | `string`  | `"Loading..."` | メインメッセージ    |
| `subMessage`   | `string`  | `undefined`    | サブメッセージ      |
| `fullscreen`   | `boolean` | `true`         | フルスクリーン表示  |
| `spinnerColor` | `string`  | `"#3d7fff"`    | スピナーの色        |
| `spinnerSize`  | `number`  | `48`           | スピナーのサイズ    |
| `enableSound`  | `boolean` | `true`         | サウンドの有効/無効 |
| `show`         | `boolean` | `true`         | 表示/非表示の制御   |

### UseLoadingOptions

| プロパティ      | 型        | デフォルト  | 説明                         |
| --------------- | --------- | ----------- | ---------------------------- |
| `enableSound`   | `boolean` | `true`      | サウンドの有効/無効          |
| `autoStopAfter` | `number`  | `undefined` | 自動停止までの時間（ミリ秒） |

## 使用例

### 1. API 呼び出し時のローディング

```typescript
import { useLoading } from "@/hooks/useLoading";
import LoadingWithSound from "@/components/LoadingWithSound";

function DataFetchingComponent() {
  const { isLoading, withLoading } = useLoading();

  const fetchData = async () => {
    const data = await withLoading(async () => {
      const response = await fetch("/api/data");
      return response.json();
    });
    console.log(data);
  };

  return (
    <div>
      <LoadingWithSound show={isLoading} />
      <button onClick={fetchData}>データ取得</button>
    </div>
  );
}
```

### 2. フォーム送信時のローディング

```typescript
import { useLoading } from "@/hooks/useLoading";
import LoadingWithSound from "@/components/LoadingWithSound";

function FormComponent() {
  const { isLoading, withLoading } = useLoading();

  const handleSubmit = async (formData: FormData) => {
    await withLoading(async () => {
      await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <LoadingWithSound
        show={isLoading}
        message="送信中..."
        subMessage="しばらくお待ちください"
      />
      {/* フォームフィールド */}
      <button type="submit" disabled={isLoading}>
        送信
      </button>
    </form>
  );
}
```

### 3. ページ遷移時のローディング

```typescript
import { useLoading } from "@/hooks/useLoading";
import LoadingWithSound from "@/components/LoadingWithSound";

function PageTransitionComponent() {
  const { isLoading, startLoading, stopLoading } = useLoading();

  const handlePageTransition = async () => {
    startLoading();
    try {
      await router.push("/next-page");
    } finally {
      stopLoading();
    }
  };

  return (
    <div>
      <LoadingWithSound show={isLoading} message="ページを読み込み中..." />
      <button onClick={handlePageTransition}>次のページへ</button>
    </div>
  );
}
```

### 4. 長時間処理のローディング

```typescript
import { useLoading } from "@/hooks/useLoading";
import LoadingWithSound from "@/components/LoadingWithSound";

function LongProcessComponent() {
  const { isLoading, withLoading } = useLoading({
    autoStopAfter: 30000, // 30秒後に自動停止
  });

  const handleLongProcess = async () => {
    await withLoading(async () => {
      // 長時間の処理
      await new Promise((resolve) => setTimeout(resolve, 25000));
    });
  };

  return (
    <div>
      <LoadingWithSound
        show={isLoading}
        message="処理中..."
        subMessage="時間がかかる場合があります"
      />
      <button onClick={handleLongProcess}>長時間処理を開始</button>
    </div>
  );
}
```

## 注意事項

1. **ブラウザ制限**: 一部のブラウザでは、ユーザーインタラクションがないとサウンドが再生されない場合があります。

2. **パフォーマンス**: Progress 音はループ再生されるため、長時間のローディングでは注意が必要です。

3. **自動停止**: `autoStopAfter`を設定することで、長時間のローディングを自動停止できます。

4. **サウンド無効化**: `enableSound={false}`でサウンドを無効にできます。

5. **メモリリーク防止**: コンポーネントがアンマウントされる時に自動的にサウンドが停止されます。

## 技術仕様

- **サウンドライブラリ**: [snd-lib](https://github.com/snd-lib/snd-lib)
- **サウンドタイプ**: `SND.SOUNDS.PROGRESS_LOOP`
- **再生タイミング**: ローディング開始時に開始、終了時に停止
- **エラーハンドリング**: サウンド再生失敗時はコンソールログのみ
- **ブラウザ対応**: Web Audio API 対応ブラウザ
