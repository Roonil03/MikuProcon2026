# Roonil03 - Magical Mirai 2026

This is the codebase for the Magical Mirai 2026 Programming Contest, visualizing the song "Shutter Chance" by Yamiagari. The application simulates an interactive 3D camera lens where users capture kinetic typography synced to the beat, featuring full WebXR Augmented Reality (AR) support on mobile devices.

## Features

- **Audio-Reactive Soundscape**: A fully custom WebGL GLSL shader tunnel that pulses to the beat of the song using a Warm Gold and Cool Blue color palette.
- **WebXR AR Viewfinder**: On mobile devices, seamlessly transition from the virtual tunnel to a transparent Augmented Reality pass-through, bringing the flying 3D lyrics into your real-world living room!
- **Cinematic Camera Sweeps**: High-performance GSAP animations shift your camera perspective when successfully capturing lyrics on the beat.
- **Multi-Language Support**: A fully localized UI with a toggle between English and Japanese, featuring distinct typography for both.
- **Custom Typography**: Stunning typography using Google Fonts like *Londrina Shadow*, *Shizuru*, *Orbitron*, and *Zen Kaku Gothic New*.
- **Zero-Latency Cursor**: Optimized React and DOM architecture for lightning-fast crosshair tracking.

## Technology Stack

- **Vite** & **React**: Core application framework.
- **React Three Fiber** & **Drei**: 3D scene rendering and typography manipulation.
- **WebXR Device API**: Using `@react-three/xr` v6 for immersive AR modes.
- **PostProcessing**: Camera lens simulation (Depth of Field, Bloom, Chromatic Aberration).
- **Zustand**: Global application state management.
- **GSAP**: High-performance kinematics and animations.
- **TextAlive App API**: Millisecond-precise audio and lyric synchronization.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Deployment:
   - This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically build and deploy to GitHub Pages upon pushing to the `main` branch.

## Credits & Contributions
For a full list of contributions, libraries, fonts, and creative commons assets used in this project, please see the [CREDITS.md](./CREDITS.md) file.

---

私は日本語の初心者で、現在学習中です。ここのテキストのほとんどは翻訳アプリを使用しているため、誰かを傷つけたり不快にさせる意図はありません。もし問題がありましたら、事前にお詫び申し上げます。

# Roonil03 - マジカルミライ 2026

これは、マジカルミライ 2026 プログラミング・コンテストのコードベースであり、夜未アガリの楽曲「シャッターチャンス」を視覚化します。このアプリケーションは、ユーザーがビートに合わせてキネティック・タイポグラフィをキャプチャするインタラクティブな3Dカメラレンズをシミュレートしており、モバイルデバイスでのWebXR拡張現実（AR）を完全にサポートしています。

## 機能

- **オーディオリアクティブ・サウンドスケープ**: Warm Gold（温かみのあるゴールド）とCool Blue（クールなブルー）のカラーパレットを使用し、曲のビートに合わせて脈打つ、完全カスタムのWebGL GLSLシェーダートンネル。
- **WebXR ARビューファインダー**: モバイルデバイスでは、仮想トンネルから透明な拡張現実パススルーへとシームレスに移行し、現実の部屋に飛んでくる3Dの歌詞を映し出します！
- **映画のようなカメラスイープ**: ビートに合わせて歌詞のキャプチャに成功すると、高性能なGSAPアニメーションがカメラの視点を移動させます。
- **多言語サポート**: 英語と日本語の切り替えが可能な完全ローカライズされたUI。それぞれに特徴的なタイポグラフィを採用。
- **カスタムタイポグラフィ**: *Londrina Shadow*、*Shizuru*、*Orbitron*、*Zen Kaku Gothic New*などのGoogle Fontsを使用した見事なタイポグラフィ。
- **ゼロレイテンシ・カーソル**: 超高速のクロスヘア追跡のために最適化されたReactとDOMアーキテクチャ。

## 技術スタック

- **Vite** と **React**: アプリケーションのコアフレームワーク。
- **React Three Fiber** と **Drei**: 3Dシーンのレンダリングとタイポグラフィ操作。
- **WebXR Device API**: 没入型ARモードのための `@react-three/xr` v6 の使用。
- **PostProcessing**: カメラレンズのシミュレーション（被写界深度、ブルーム、色収差）。
- **Zustand**: グローバルアプリケーション状態管理。
- **GSAP**: 高性能なキネマティクスとアニメーション。
- **TextAlive App API**: ミリ秒精度のオーディオと歌詞の同期。

## セットアップ手順

1. 依存関係をインストールします:
   ```bash
   npm install
   ```
2. 開発サーバーを起動します:
   ```bash
   npm run dev
   ```
3. デプロイ:
   - このプロジェクトには、`main`ブランチにプッシュした際にGitHub Pagesに自動的にビルドしてデプロイするためのGitHub Actionsワークフロー（`.github/workflows/deploy.yml`）が含まれています。

## クレジットと貢献
このプロジェクトで使用されている貢献、ライブラリ、フォント、およびクリエイティブ・コモンズの資産の完全なリストについては、[CREDITS.md](./CREDITS.md)ファイルを参照してください。
