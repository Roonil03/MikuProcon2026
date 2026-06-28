# Magical Mirai 2026 - Shutter Chance

This is the codebase for the Magical Mirai 2026 Programming Contest, visualizing the song "Shutter Chance" by Yamiagari. The application simulates an interactive 3D camera lens where users capture kinetic typography synced to the beat. It dynamically adapts its gameplay controls based on your device: offering a precision mouse/cursor mode on laptop-like devices, and an immersive WebXR Augmented Reality (AR) gyroscope/tilt movement mode on phone-like devices.

## Features

- **Audio-Reactive Soundscape**: A fully custom WebGL GLSL shader tunnel that pulses to the beat of the song using a Warm Gold and Cool Blue color palette.
- **Adaptive Gameplay Modes**: On laptop and desktop devices, experience lightning-fast precision cursor controls to aim the viewfinder. On phone and mobile devices, seamlessly transition to device tilt movement or a transparent Augmented Reality (AR) pass-through, bringing the flying 3D lyrics into your real-world room!
- **Cinematic Camera Sweeps**: High-performance GSAP animations shift your camera perspective when successfully capturing lyrics on the beat.
- **Multi-Language Support**: A fully localized UI with a toggle between English and Japanese, featuring distinct typography for both.
- **Custom Typography**: Stunning typography using Google Fonts like *Kranky*, *Shizuru*, *Press Start 2P*, *M PLUS 1p*, and *Zen Kaku Gothic New*.
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
## Credits & Contributions
For a full list of contributions, libraries, fonts, and creative commons assets used in this project, please see the [CREDITS.md](./CREDITS.md) file.

---

私は日本語の初心者で、現在学習中です。ここのテキストのほとんどは翻訳アプリを使用しているため、誰かを傷つけたり不快にさせる意図はありません。もし問題がありましたら、事前にお詫び申し上げます。

# マジカルミライ 2026 - シャッターチャンス

これは、マジカルミライ 2026 プログラミング・コンテストのコードベースであり、夜未アガリの楽曲「シャッターチャンス」を視覚化します。このアプリケーションは、ユーザーがビートに合わせてキネティック・タイポグラフィをキャプチャするインタラクティブな3Dカメラレンズをシミュレートしています。デバイスに応じて操作方法がダイナミックに変わり、ラップトップやPCなどの環境ではマウス・カーソル操作によるモードを、スマートフォンなどのモバイル環境ではWebXR拡張現実（AR）やジャイロスコープ/傾き操作による没入型ムーブメントモードを提供します。

## 機能

- **オーディオリアクティブ・サウンドスケープ**: Warm Gold（温かみのあるゴールド）とCool Blue（クールなブルー）のカラーパレットを使用し、曲のビートに合わせて脈打つ、完全カスタムのWebGL GLSLシェーダートンネル。
- **アダプティブ・ゲームプレイモード**: ラップトップやデスクトップ機器では、超高速で正確なカーソル操作によってファインダーを合わせます。スマートフォンやモバイル機器では、デバイスを傾けるムーブメント操作や、透明な拡張現実（AR）パススルーにシームレスに移行し、現実の部屋に飛んでくる3Dの歌詞を映し出します！
- **映画のようなカメラスイープ**: ビートに合わせて歌詞のキャプチャに成功すると、高性能なGSAPアニメーションがカメラの視点を移動させます。
- **多言語サポート**: 英語と日本語の切り替えが可能な完全ローカライズされたUI。それぞれに特徴的なタイポグラフィを採用。
- **カスタムタイポグラフィ**: *Kranky*、*Shizuru*、*Press Start 2P*、*M PLUS 1p*、*Zen Kaku Gothic New*などのGoogle Fontsを使用した見事なタイポグラフィ。
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

## クレジットと貢献
このプロジェクトで使用されている貢献、ライブラリ、フォント、およびクリエイティブ・コモンズの資産の完全なリストについては、[CREDITS.md](./CREDITS.md)ファイルを参照してください。
