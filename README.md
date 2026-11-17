## 概要
* [ヒラリラー](https://hirarira.net/) アニメレビュー表示アプリ
* 現状では [アニメ見逃しアニメ](https://github.com/hirarira/showMinogashiAnime) でバックエンドを動かしています。

## 開発
* Node.js 22系 + Vite
* `npm ci` → `npm run dev`（開発） / `npm run build`（本番ビルド、出力は `dist/`）

## 備考
* Phase 1移行（2026-11）: CRA → Vite、React 19、TypeScript 5、react-router 7、MUI v9 に更新。
* Googleログイン機能と、管理ページ（showMinogashiAnime）へのリンクは撤去済み。管理ページへは直接アクセスする。
