import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

export class ImageFileHistory {
  private historyDir: string;
  private maxHistoryItems = 10;

  constructor() {
    this.historyDir = path.join(os.tmpdir(), "vscode-image-file-paste-history");
    this.ensureHistoryDir();
  }

  private async ensureHistoryDir(): Promise<void> {
    try {
      await fs.mkdir(this.historyDir, { recursive: true });
    } catch (error) {
      console.error("Failed to create history directory:", error);
    }
  }

  async save(filePath: string, content: Buffer): Promise<void> {
    const timestamp = Date.now();
    const baseName = path.basename(filePath);
    const historyFileName = `${timestamp}_${baseName}`;
    const historyPath = path.join(this.historyDir, historyFileName);

    // 履歴を保存
    await fs.writeFile(historyPath, content);

    // 古い履歴を削除
    await this.cleanupOldHistory();

    // メタデータを保存
    const metadataPath = path.join(this.historyDir, `${historyFileName}.json`);
    await fs.writeFile(
      metadataPath,
      JSON.stringify({
        originalPath: filePath,
        timestamp: timestamp,
        savedAt: new Date().toISOString(),
      })
    );
  }

  async restore(filePath: string): Promise<Buffer | null> {
    try {
      const files = await fs.readdir(this.historyDir);
      const baseName = path.basename(filePath);

      // 最新の履歴を探す
      const historyFiles = files
        .filter((f) => f.endsWith(baseName) && !f.endsWith(".json"))
        .sort()
        .reverse();

      if (historyFiles.length === 0) {
        return null;
      }

      const latestHistory = historyFiles[0];
      const historyPath = path.join(this.historyDir, latestHistory);

      return await fs.readFile(historyPath);
    } catch (error) {
      console.error("Failed to restore from history:", error);
      return null;
    }
  }

  private async cleanupOldHistory(): Promise<void> {
    try {
      const files = await fs.readdir(this.historyDir);
      const historyFiles = files.filter((f) => !f.endsWith(".json")).sort();

      // 最大数を超えた古いファイルを削除
      if (historyFiles.length > this.maxHistoryItems) {
        const filesToDelete = historyFiles.slice(
          0,
          historyFiles.length - this.maxHistoryItems
        );

        for (const file of filesToDelete) {
          await fs.unlink(path.join(this.historyDir, file));
          // メタデータも削除
          try {
            await fs.unlink(path.join(this.historyDir, `${file}.json`));
          } catch {
            // メタデータがない場合は無視
          }
        }
      }
    } catch (error) {
      console.error("Failed to cleanup history:", error);
    }
  }
}
