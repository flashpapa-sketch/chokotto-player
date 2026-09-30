# ちょこっとplayer

ハイレゾ対応の、小さな音楽・動画プレイヤー（Windows 用）。

![ちょこっとplayer](docs/main@2x.png)

## ダウンロード（期間限定公開）

最新版は [Releases](https://github.com/flashpapa-sketch/chokotto-player/releases/latest) からどうぞ。

| ファイル | 内容 |
|---|---|
| `chokotto-player-1.1.1-setup.exe` | インストーラー版 |
| `chokotto-player-1.1.1-portable.zip` | インストール不要版（展開してすぐ使える） |

## できること

- FLAC / ALAC / WAV / MP3 / AAC / OGG / OPUS などを再生。ALAC（Apple Lossless）にも対応
- ハイレゾ（24bit/96kHz など）の形式を表示。「ハイレゾ優先」で加工せずに出力
- 見た目は 17 種類。スキンのフォルダに CSS を置けば自作スキンも追加可能
- 懐かしの `.wsz` クラシックスキンの読み込みに対応。本体の大きさも 275×116
- 10 バンドのイコライザ、プレイリスト
- タグから「アーティスト - 曲名」を表示。足りない曲名だけネットで補う機能つき（既定はオフ）
- 勝手に通信しない。履歴を残さない

![17種類の見た目](docs/skins.png)

## 初めて起動するとき

署名のないアプリのため、初回に「Windows によって PC が保護されました」と表示されることがあります。
「詳細情報」→「実行」で起動できます。ウイルスが見つかったという意味ではありません。

## ファイルの確認（SHA-256）

```
ad4d2d96aed5d9ef2e7d329d93f444ef59b6545da2c1fef332131307331f9cff  chokotto-player-1.1.1-setup.exe
f0afabbf37a9e09e1eb8c2db40ee30458d1351c552928f998cae9b5bcd2d2ec4  chokotto-player-1.1.1-portable.zip
```

PowerShell で `Get-FileHash .\ファイル名` と打つと確かめられます。

## ライセンスについて

本体に含まれる第三者のソフトウェア（Electron、Chromium、libFLAC、LAME、ALAC デコーダ）と
同梱フォント（SIL Open Font License 1.1）の表記は、同梱の `THIRD-PARTY-NOTICES.txt` と
`fonts-licenses` フォルダをご覧ください。

本ソフトウェアは Winamp の開発元・権利者とは無関係です。

© 2026 Chokotto Software
