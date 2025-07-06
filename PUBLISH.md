VSCode 拡張機能をマーケットプレイスに公開する手順を説明します。

## 事前準備

### 必要なアカウントとツール

1. **Microsoft アカウント** - Visual Studio Marketplace にサインインするため
2. **Azure DevOps アカウント** - パブリッシャーアカウントを作成するため
3. **Node.js と npm** - 開発環境
4. **vsce（Visual Studio Code Extension Manager）** - 拡張機能をパッケージング・公開するツール

```bash
npm install -g @vscode/vsce
```

## パブリッシャーアカウントの作成

1. [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)にアクセス
2. Microsoft アカウントでサインイン
3. 「Create publisher」をクリック
4. パブリッシャー ID（一意の識別子）と表示名を設定

## 拡張機能の準備

### package.json の必須項目

```json
{
  "name": "your-extension-name",
  "displayName": "Your Extension Display Name",
  "description": "拡張機能の説明",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.74.0"
  },
  "publisher": "your-publisher-id",
  "categories": ["Other"],
  "keywords": ["keyword1", "keyword2"],
  "repository": {
    "type": "git",
    "url": "https://github.com/username/repo"
  },
  "icon": "icon.png",
  "main": "./extension.js",
  "contributes": {
    // 拡張機能の貢献内容
  }
}
```

### 必要なファイル

- **README.md** - 拡張機能の詳細説明（マーケットプレイスに表示される）
- **CHANGELOG.md** - バージョン履歴
- **LICENSE** - ライセンスファイル
- **icon.png** - 128x128 ピクセルのアイコン（PNG 形式）
- **.vscodeignore** - パッケージから除外するファイルを指定

## パッケージングと公開

### 1. パッケージの作成（テスト用）

```bash
vsce package
```

これにより`.vsix`ファイルが生成されます。

### 2. パブリッシャートークンの取得

1. [Azure DevOps](https://dev.azure.com/)にアクセス
2. User settings → Personal access tokens
3. 「New Token」をクリック
4. スコープで「Marketplace (Manage)」を選択
5. トークンを安全に保存

### 3. 拡張機能の公開

```bash
# ログイン
vsce login your-publisher-id

# 公開
vsce publish

# または、バージョンを自動インクリメントして公開
vsce publish minor  # 0.0.1 → 0.1.0
vsce publish patch  # 0.0.1 → 0.0.2
```

## 公開前のチェックリスト

- 拡張機能が正常に動作することを確認
- README.md に機能説明、使用方法、スクリーンショットを含める
- package.json のすべての必須フィールドが記入されている
- アイコンが適切なサイズと形式である
- .vscodeignore で不要なファイルを除外している
- ライセンスが明記されている
- リポジトリ URL が正しい

## 公開後の管理

- マーケットプレイスで拡張機能が表示されるまで数分かかります
- [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)で統計情報やレビューを確認
- バグ修正や機能追加後は、バージョンを更新して再公開

何か特定の部分で困っていることがあれば、詳しく説明します。
