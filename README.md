# Home Myanmar Restaurant

那覇のミャンマー料理店「အိမ်လွမ်းပြေ」の注文・配達Webアプリです。
一般的なNext.js App Router構成のWebアプリです。

## Prerequisites

- Node.js `>=20.9.0`
- npm

## Quick Start

```bash
npm install
npm run dev
```

ブラウザーで [http://localhost:3000](http://localhost:3000) を開いてください。

## Commands

- `npm run dev` — 開発サーバー
- `npm run build` — 本番ビルド
- `npm run start` — 本番サーバー
- `npm run lint` — コードチェック
- `npm test` — 本番ビルドによる検証

## Main pages

- `/` — お客様向けメニュー・カート・チェックアウト
- `/staff` — 店舗スタッフ向け管理画面

カートと注文履歴はブラウザーのlocalStorageに保存されます。

## GitHub Pages

`main`ブランチへ変更を反映すると、GitHub Actionsが静的サイトを作成してGitHub Pagesへ公開します。
リポジトリの **Settings → Pages → Build and deployment** で、Sourceを **GitHub Actions** に設定してください。
