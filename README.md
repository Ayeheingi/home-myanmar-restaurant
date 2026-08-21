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

## Demo information

このリポジトリはポートフォリオ／画面確認用の静的デモです。

- 店名、住所（沖縄県那覇市泉崎 1-1）、電話番号（090-1234-0000）、メール（home@gmail.com）はサンプルです。
- `4.9 / 1,240 reviews`、注文、売上、材料・在庫もデモデータです。
- カードとPayPayは画面フロー確認用の「デモ決済」で、実際の請求・決済処理は行いません。
- お客様注文とStaff画面は、同じブラウザー／同じ端末の `localStorage` で連携します。異なる端末やブラウザー間の同期にはAPIとデータベースが必要です。
- `/staff` は役割別ログインで画面を保護していますが、GitHub Pages上の静的デモ認証です。本番運用ではサーバー側認証、セッション管理、権限確認を実装してください。
- 配送料は商品合計が¥2,000未満の場合¥300、¥2,000以上は無料です。
- 営業時間、定休日、配達範囲、特定商取引法・プライバシー・キャンセル表示もデモ内容です。公開店舗で利用する前に正式情報へ差し替えてください。

デモ用クーポン：`HOME10`（10%OFF）、`NAHA200`（商品合計¥1,500以上で¥200OFF）。

## GitHub Pages

`main`ブランチへ変更を反映すると、GitHub Actionsが静的サイトを作成してGitHub Pagesへ公開します。
リポジトリの **Settings → Pages → Build and deployment** で、Sourceを **GitHub Actions** に設定してください。
