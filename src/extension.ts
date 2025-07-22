import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { ImageFilePasteService } from "./services/imageFilePasteService";
import { ImageFileHistory } from "./services/imageFileHistory";

export function activate(context: vscode.ExtensionContext) {
  console.log("Image File Paste extension is activating...");
  const imageFilePasteService = new ImageFilePasteService();
  const imageFileHistory = new ImageFileHistory();

  // 通常のペーストコマンド
  const pasteCommand = vscode.commands.registerCommand(
    "imageFilePaste.paste",
    async () => {
      await handlePaste(imageFilePasteService, imageFileHistory, false);
    }
  );

  // リサイズしてペーストコマンド
  const pasteWithResizeCommand = vscode.commands.registerCommand(
    "imageFilePaste.pasteWithResize",
    async () => {
      await handlePaste(imageFilePasteService, imageFileHistory, true);
    }
  );

  // Undoコマンド
  const undoCommand = vscode.commands.registerCommand(
    "imageFilePaste.undo",
    async () => {
      await handleUndo(imageFileHistory);
    }
  );

  // VS Codeの標準的なUndo操作をオーバーライド
  const undoOverride = vscode.commands.registerCommand("undo", async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const filePath = editor.document.fileName;
      const ext = path.extname(filePath).toLowerCase();

      // 画像ファイルの場合は独自のUndo処理（JPEG/PNGのみ）
      if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        await handleUndo(imageFileHistory);
        return;
      }
    }

    // 画像以外は標準のUndo処理
    await vscode.commands.executeCommand("default:undo");
  });

  context.subscriptions.push(
    pasteCommand,
    pasteWithResizeCommand,
    undoCommand,
    undoOverride
  );
}

async function handlePaste(
  imageFilePasteService: ImageFilePasteService,
  imageFileHistory: ImageFileHistory,
  withResize: boolean
) {
  console.log("handlePaste called, withResize:", withResize);

  let filePath: string | undefined;

  // まずアクティブエディタから取得を試みる
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    filePath = editor.document.fileName;
    console.log("Got file from active editor:", filePath);
  } else {
    // エディタがない場合は、現在開いているタブから取得
    console.log("No active editor, checking active tab...");
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;

    if (
      activeTab &&
      activeTab.input &&
      typeof activeTab.input === "object" &&
      "uri" in activeTab.input
    ) {
      const tabInput = activeTab.input as { uri: vscode.Uri };
      filePath = tabInput.uri.fsPath;
      console.log("Got file from active tab:", filePath);
    } else {
      console.log("No active tab with file");
      vscode.window.showWarningMessage("Please open an image file");
      return;
    }
  }

  if (!filePath) {
    console.log("No file path found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  console.log("File path:", filePath, "Extension:", ext);

  // 画像ファイルかチェック（JPEG/PNGのみ）
  if (![".png", ".jpg", ".jpeg"].includes(ext)) {
    console.log("Not a supported image file (only PNG/JPEG supported)");
    return;
  }

  try {
    // クリップボードから画像を取得
    console.log("Getting image from clipboard...");
    const clipboardImage = await imageFilePasteService.getImageFromClipboard();
    console.log("Clipboard image:", clipboardImage ? "Found" : "Not found");

    if (!clipboardImage) {
      vscode.window.showWarningMessage("No image found in clipboard");
      return;
    }

    // 現在のファイルを履歴に保存
    const currentContent = await fs.readFile(filePath);
    await imageFileHistory.save(filePath, currentContent);

    let imageToSave = clipboardImage;

    // リサイズ処理
    if (withResize) {
      const currentImageInfo = await imageFilePasteService.getImageInfo(
        filePath
      );
      const widthStr = await vscode.window.showInputBox({
        prompt: `Current image width: ${currentImageInfo.width}px\nEnter new width:`,
        placeHolder: "e.g. 800",
        validateInput: (value) => {
          const num = parseInt(value);
          if (isNaN(num) || num <= 0) {
            return "Please enter a positive integer";
          }
          return null;
        },
      });

      if (!widthStr) {
        return;
      }

      const newWidth = parseInt(widthStr);
      imageToSave = await imageFilePasteService.resizeImage(
        clipboardImage,
        newWidth
      );
    }

    // 画像を保存
    await imageFilePasteService.saveImage(imageToSave, filePath, ext);

    // VS Codeに変更を認識させる
    // 画像プレビューの場合は再度開く
    if (!editor) {
      // 画像ファイルを直接開く（テキストエディタとしてではなく）
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
      // 少し待機してファイルシステムの更新を確実に反映
      await new Promise((resolve) => setTimeout(resolve, 100));
      await vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.file(filePath)
      );
    }

    vscode.window.showInformationMessage("Image pasted successfully");
  } catch (error) {
    vscode.window.showErrorMessage(`Error occurred: ${error}`);
  }
}

async function handleUndo(imageFileHistory: ImageFileHistory) {
  let filePath: string | undefined;
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    filePath = editor.document.fileName;
  } else {
    // エディタがない場合は、現在開いているタブから取得
    const activeTab = vscode.window.tabGroups.activeTabGroup.activeTab;

    if (
      activeTab &&
      activeTab.input &&
      typeof activeTab.input === "object" &&
      "uri" in activeTab.input
    ) {
      const tabInput = activeTab.input as { uri: vscode.Uri };
      filePath = tabInput.uri.fsPath;
    } else {
      vscode.window.showWarningMessage("Please open an image file");
      return;
    }
  }

  if (!filePath) {
    return;
  }

  const ext = path.extname(filePath).toLowerCase();

  // 画像ファイルかチェック（JPEG/PNGのみ）
  if (![".png", ".jpg", ".jpeg"].includes(ext)) {
    vscode.window.showWarningMessage("Not a supported image file (only PNG/JPEG supported)");
    return;
  }

  try {
    // 履歴から復元
    const previousContent = await imageFileHistory.restore(filePath);
    if (!previousContent) {
      vscode.window.showInformationMessage("No history available to restore");
      return;
    }

    // ファイルを復元
    await fs.writeFile(filePath, previousContent);

    // VS Codeに変更を認識させる
    // 画像プレビューの場合は再度開く
    if (!editor) {
      await vscode.commands.executeCommand(
        "workbench.action.closeActiveEditor"
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      await vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.file(filePath)
      );
    }

    vscode.window.showInformationMessage("Image restored successfully");
  } catch (error) {
    vscode.window.showErrorMessage(`Error during restore: ${error}`);
  }
}

export function deactivate() {
  // Clean up resources if needed
}
