# VS Code Image Paste

[English](README.md) | 日本語

Visual Studio Code で画像ファイルを編集中に、クリップボードから画像をペーストできる拡張機能です。

## 機能

- 🖼️ **画像の直接ペースト**: 画像ファイルを開いている状態で、他のアプリケーションからコピーした画像を直接ペースト
- 📐 **リサイズしてペースト**: 画像の幅を指定してリサイズしながらペースト（アスペクト比は自動維持）
- 🔄 **形式の自動変換**: ペースト先のファイル拡張子に応じて画像形式を自動変換
- ↩️ **Undo機能**: ペースト操作を取り消して元の画像に戻す

## 対応画像形式

- PNG
- JPEG / JPG
- GIF
- WebP（一部制限あり）

## 開発環境のセットアップ

### 必要なもの

- [Node.js](https://nodejs.org/) (v16以上)
- [Visual Studio Code](https://code.visualstudio.com/)
- npm または yarn

### 初めてのVS Code拡張機能開発の方へ

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yourusername/vscode-image-paste.git
   cd vscode-image-paste
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **TypeScriptのコンパイル**
   ```bash
   npm run compile
   ```

## 開発方法

### 拡張機能の実行とデバッグ

1. VS Codeでこのプロジェクトを開く
2. `F5`キーを押すか、デバッグビューから「Run Extension」を実行
3. 新しいVS Codeウィンドウが開き、拡張機能が読み込まれた状態になります

### デバッグのヒント

- ブレークポイントを設定: TypeScriptファイルの行番号の左をクリック
- コンソールログ: デバッグコンソールで確認可能
- エラー: 「問題」パネルでTypeScriptエラーを確認

### ファイル構成

```
vscode-image-paste/
├── src/
│   ├── extension.ts          # メインの拡張機能エントリーポイント
│   ├── services/
│   │   ├── imagePasteService.ts  # 画像処理サービス
│   │   └── imageHistory.ts       # 履歴管理サービス
│   └── test/
│       └── suite/            # テストファイル
├── package.json              # 拡張機能マニフェスト
├── tsconfig.json            # TypeScript設定
└── README.md               # このファイル
```

## ビルドとインストール

### ローカルでのインストール

1. **拡張機能のパッケージ化**
   ```bash
   npm install -g vsce
   vsce package
   ```

2. **生成された.vsixファイルをインストール**
   - VS Codeを開く
   - コマンドパレット（`Ctrl+Shift+P` / `Cmd+Shift+P`）を開く
   - 「Extensions: Install from VSIX...」を選択
   - 生成された.vsixファイルを選択

## 使い方

### 基本的なペースト

1. VS Codeで画像ファイル（.png, .jpg等）を開く
2. 他のアプリケーションで画像をコピー
3. VS Codeで`Ctrl+V`（Mac: `Cmd+V`）でペースト

### リサイズしてペースト

1. 画像ファイルを開いた状態で右クリック
2. 「Paste Image with Resize」を選択
3. 現在の画像幅が表示されるので、新しい幅を入力
4. 自動的にアスペクト比を維持してリサイズされペースト

### Undo（元に戻す）

画像ファイルで`Ctrl+Z`（Mac: `Cmd+Z`）を押すと、直前のペースト操作を取り消せます。

## テストの実行

```bash
npm test
```

## トラブルシューティング

### クリップボードから画像を取得できない

- **macOS**: 特に問題ありません
- **Windows**: PowerShellの実行ポリシーを確認してください
- **Linux**: `xclip`がインストールされているか確認してください
  ```bash
  sudo apt-get install xclip  # Ubuntu/Debian
  ```

### 画像が正しく保存されない

- ファイルの書き込み権限を確認してください
- ディスク容量が十分にあるか確認してください

## 貢献

プルリクエストを歓迎します！バグ報告や機能提案はIssuesでお願いします。

## ライセンス

MIT