import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import * as os from "os";
import { ImageFilePasteService } from "../../services/imageFilePasteService";
import { ImageFileHistory } from "../../services/imageFileHistory";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("拡張機能が読み込まれる", () => {
    const extension = vscode.extensions.getExtension(
      "ideamans.vscode-image-file-paste"
    );
    assert.strictEqual(extension !== undefined, true);
  });

  test("画像形式の変換テスト", async () => {
    const imageFilePasteService = new ImageFilePasteService();
    const testImagePath = path.join(os.tmpdir(), "test-image.png");

    // テスト用の小さな画像を作成
    const testBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    await fs.writeFile(testImagePath, testBuffer);

    try {
      // PNGからJPEGへの変換
      await imageFilePasteService.saveImage(
        testBuffer,
        testImagePath.replace(".png", ".jpg"),
        ".jpg"
      );

      // ファイルが作成されたか確認
      const jpegPath = testImagePath.replace(".png", ".jpg");
      const exists = await fs
        .access(jpegPath)
        .then(() => true)
        .catch(() => false);
      assert.strictEqual(exists, true);

      // クリーンアップ
      await fs.unlink(jpegPath).catch(() => {
        /* ignore */
      });
    } finally {
      await fs.unlink(testImagePath).catch(() => {
        /* ignore */
      });
    }
  });

  test("リサイズ機能のテスト", async () => {
    const imageFilePasteService = new ImageFilePasteService();

    // 1x1の小さな画像
    const testBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64"
    );

    // リサイズ
    const resizedBuffer = await imageFilePasteService.resizeImage(
      testBuffer,
      10
    );

    // リサイズされたか確認（バッファが存在すること）
    assert.strictEqual(resizedBuffer instanceof Buffer, true);
    assert.strictEqual(resizedBuffer.length > 0, true);
  });

  test("履歴保存と復元のテスト", async () => {
    const imageFileHistory = new ImageFileHistory();
    const testPath = "/test/image.png";
    const testContent = Buffer.from("test content");

    // 履歴を保存
    await imageFileHistory.save(testPath, testContent);

    // 履歴から復元
    const restored = await imageFileHistory.restore(testPath);

    // 内容が一致するか確認
    assert.strictEqual(restored !== null, true);
    if (restored) {
      assert.strictEqual(restored.toString(), testContent.toString());
    }
  });
});
