# VS Code Image Paste - 公開前の TODO リスト

## 必須項目

### package.json の更新

- [x] `keywords`フィールドを追加（検索性向上のため）
- [x] `icon`フィールドを追加（アイコンファイルのパスを指定）

### 必要なファイルの作成

- [x] **CHANGELOG.md** - バージョン履歴ファイルを作成
- [x] **icon.png** - 128x128 ピクセルのアイコンを作成（PNG 形式）
- [x] **.vscodeignore** - パッケージから除外するファイルを指定

### README.md の改善

- [x] 使用方法のスクリーンショットを追加
- [ ] インストール方法（マーケットプレイスから）を追加
- [x] 機能の GIF アニメーションまたは画像を追加

### 品質向上

- [ ] エラーハンドリングの強化（特にクリップボード操作失敗時）
- [ ] より詳細なログ出力（デバッグ用）の削除または本番用に調整

### 公開準備

- [x] vsce ツールのインストール: `npm install -g @vscode/vsce`
- [x] パッケージのテスト: `vsce package`でエラーがないか確認
- [x] 拡張機能 ID の確認（package.json の name）
- [x] バージョン番号の確認（0.0.1 で問題ないか）

### マーケットプレイス用の準備

- [x] カテゴリーの見直し（現在は"Other"だが、より適切なカテゴリーがあるか検討）
- [x] 拡張機能の説明文を魅力的に改善

### ドキュメントの最終確認

- [x] ライセンス年と著作者名の確認

### テスト

- [ ] Windows 環境でのテスト
- [ ] Linux 環境でのテスト
- [ ] 大きな画像ファイルでのテスト
- [x] 異なる画像形式間の変換テスト

## オプション（推奨）

### 追加機能の検討

- [x] コマンドパレットからの実行サポート

## 完了後のチェック

- [x] `vsce package`でパッケージが正常に作成されることを確認
- [ ] 生成された.vsix ファイルをローカルでインストールしてテスト
- [ ] すべての機能が期待通りに動作することを確認
