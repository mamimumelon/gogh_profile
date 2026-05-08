# gogh プロフ帳メーカー

[gogh](https://gogh.gg) のお部屋・好きな家具・コーデなどを書きこんで、平成プロフィール帳風の画像を生成・SNS シェアできる Web アプリ。

> ⚠️ このサイトは非公式のファンメイドです。

## 機能

- アバター画像のアップロード（5MB まで・円形 4 色フレーム）
- 名前 / X (Twitter) ユーザー名の表示
- 好きな家具・お部屋の雰囲気・コーデ・作業のお供・聴いてる音楽・ひとこと、各項目に**サジェスト候補チップ**
- 平成プロフィール帳風デザイン（多色ストライプ縁・ドット背景・washi tape 風装飾・ジグザグ罫線・タグラベル色ローテ）
- 丸文字フォント（Hachi Maru Pop / Yusei Magic / Mochiy Pop One / DotGothic16）
- **PNG 画像でダウンロード**（高解像度 / `html-to-image`）

## 技術スタック

- [Next.js 15](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [html-to-image](https://github.com/bubkoo/html-to-image)
- フォント: Google Fonts（Hachi Maru Pop / Yusei Magic / Mochiy Pop One / Klee One / DotGothic16）

## 開発環境

開発環境は **Nix Flake + direnv** で管理しています。Node.js 22 + pnpm が `flake.nix` 経由で提供されます。

### セットアップ

[Nix](https://nixos.org/download.html) と [direnv](https://direnv.net/) が入っている前提で:

```bash
git clone <this-repo>
cd gogh_profile
direnv allow            # flake の dev shell を有効化
pnpm install
pnpm dev                # http://localhost:3000
```

direnv を使わない場合は手動で:

```bash
nix develop
pnpm install
pnpm dev
```

### スクリプト

| コマンド          | 内容                          |
| ----------------- | ----------------------------- |
| `pnpm dev`        | 開発サーバ（HMR 付き）        |
| `pnpm build`      | プロダクションビルド          |
| `pnpm start`      | ビルド済みアプリのサーブ      |
| `pnpm lint`       | ESLint                        |
| `pnpm exec tsc --noEmit` | 型チェックのみ          |

## ディレクトリ構成

```
.
├── app/
│   ├── layout.tsx       # メタデータ + Google Fonts <link>
│   ├── page.tsx         # フォーム + プレビュー + PNG ダウンロード
│   └── globals.css      # Tailwind v4 + 平成プロフィール帳の装飾ユーティリティ
├── flake.nix            # Nix dev shell (nodejs_22 + pnpm)
├── flake.lock
├── .envrc               # direnv: use flake
├── next.config.ts
├── postcss.config.mjs   # Tailwind v4 PostCSS プラグイン
├── tsconfig.json
└── package.json
```

## デプロイ

このアプリは現状クライアント完結（API ルート・SSR・RSC サーバ処理なし）なので、**静的書き出し**して任意の静的ホスティングに置くのが最もシンプルです。

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};
```

```bash
pnpm build           # out/ に静的ファイルが生成される
```

`out/` の中身を Cloudflare Workers Static Assets / Cloudflare Pages / Vercel などに上げてください。サーバ機能（API Routes・ISR・middleware・OGP 動的生成等）が必要になったら [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) などのアダプタを検討。

## 実装メモ

- **日本語フォントは `<link>` で読み込み**（`next/font/google` で日本語サブセットを self-host するとサイズが大きくなりすぎるため）
- `<link>` に `crossOrigin="anonymous"` を指定。これがないと html-to-image が Google Fonts の `cssRules` を読めず `SecurityError` で PNG エクスポートが失敗する
- PNG エクスポート前に `document.fonts.ready` を待つことで、Web フォントがレンダリング済みの状態で画像化される
- 念のため fontEmbed 失敗時は `skipFonts: true` で再試行するフォールバック付き

## クレジット

- 元アプリ: [gogh: Focus with Your Avatar](https://gogh.gg/)
- このアプリは非公式のファンメイドツールであり、gogh の開発元とは関係ありません
