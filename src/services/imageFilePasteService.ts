import Jimp from "jimp";
import * as fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";
import * as path from "path";

const execAsync = promisify(exec);

export class ImageFilePasteService {
  async getImageFromClipboard(): Promise<Buffer | null> {
    const platform = os.platform();
    const tempFile = path.join(os.tmpdir(), `clipboard_${Date.now()}.png`);
    console.log("Platform:", platform, "Temp file:", tempFile);

    try {
      if (platform === "darwin") {
        // macOS - pbpasteを使用してシンプルに
        console.log("Executing macOS clipboard command...");
        try {
          // まず画像があるかチェック
          const { stdout: typeCheck } = await execAsync(
            'osascript -e "clipboard info"'
          );
          console.log("Clipboard info:", typeCheck);

          if (!typeCheck.includes("PNGf") && !typeCheck.includes("TIFF")) {
            console.log("No image in clipboard");
            return null;
          }

          // osascriptを使って画像を保存
          const script = `osascript -e 'set theFile to (open for access POSIX file "${tempFile}" with write permission)' -e 'try' -e 'write (the clipboard as «class PNGf») to theFile' -e 'end try' -e 'close access theFile'`;
          await execAsync(script);
          console.log("Image saved to temp file");
        } catch (error) {
          console.error("macOS clipboard error:", error);
          return null;
        }
      } else if (platform === "win32") {
        // Windows - 単純化したPowerShellアプローチ
        console.log("Executing Windows clipboard command...");
        try {
          // シンプルで確実な方法：インラインPowerShellコマンド
          const psCommand = `
            Add-Type -AssemblyName System.Windows.Forms;
            Add-Type -AssemblyName System.Drawing;
            Write-Host "Assemblies loaded";
            $formats = [System.Windows.Forms.Clipboard]::GetDataObject().GetFormats();
            Write-Host "Available formats: $($formats -join ', ')";
            if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
              Write-Host "Clipboard contains image";
              $img = [System.Windows.Forms.Clipboard]::GetImage();
              if ($img) {
                Write-Host "Image object created: $($img.Width)x$($img.Height)";
                try {
                  $img.Save('${tempFile.replace(/\\/g, "\\\\")}', [System.Drawing.Imaging.ImageFormat]::Png);
                  Write-Host "Image saved";
                  $img.Dispose();
                  Write-Host "success";
                } catch {
                  Write-Host "Save error: $_";
                }
              } else {
                Write-Host "GetImage returned null";
              }
            } else {
              Write-Host "No image in clipboard";
            }
          `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
          
          console.log("Executing PowerShell command...");
          const { stdout, stderr } = await execAsync(
            `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`
          );
          
          console.log("PowerShell output:", stdout.trim());
          if (stderr) {
            console.error("PowerShell stderr:", stderr);
          }

          if (stdout.includes("success")) {
            console.log("Image successfully retrieved from clipboard");
          } else if (stdout.includes("no image")) {
            console.log("No image found in clipboard");
            
            // 別の方法を試す：WScript.Shellを使用
            try {
              console.log("Trying alternative method with WScript...");
              const vbsScript = `
Set objShell = CreateObject("WScript.Shell")
objShell.Run "powershell -Command ""Add-Type -AssemblyName System.Windows.Forms; if([System.Windows.Forms.Clipboard]::ContainsImage()) { [System.Windows.Forms.Clipboard]::GetImage().Save('${tempFile.replace(/\\/g, "\\\\")}', [System.Drawing.Imaging.ImageFormat]::Png); 'success' } else { 'no image' }"" > ""${tempFile}.txt""", 0, True
`;
              const vbsFile = path.join(os.tmpdir(), `clipboard_${Date.now()}.vbs`);
              await fs.writeFile(vbsFile, vbsScript);
              await execAsync(`cscript //NoLogo "${vbsFile}"`);
              await fs.unlink(vbsFile);
              
              // 結果を確認
              const resultFile = `${tempFile}.txt`;
              if (await fs.access(resultFile).then(() => true).catch(() => false)) {
                const result = await fs.readFile(resultFile, 'utf8');
                await fs.unlink(resultFile);
                console.log("VBS result:", result);
                if (!result.includes("success")) {
                  return null;
                }
              } else {
                return null;
              }
            } catch (vbsError) {
              console.error("VBS method failed:", vbsError);
              return null;
            }
          } else {
            console.error("Unexpected output:", stdout);
            return null;
          }
        } catch (error) {
          console.error("Windows clipboard error:", error);
          return null;
        }
      } else {
        // Linux - xclipを使用
        try {
          await execAsync(
            `xclip -selection clipboard -t image/png -o > "${tempFile}"`
          );
        } catch {
          return null;
        }
      }

      // ファイルが存在するか確認
      try {
        console.log("Checking if temp file exists...");
        await fs.access(tempFile);
        console.log("Reading temp file...");
        const buffer = await fs.readFile(tempFile);
        console.log("Buffer size:", buffer.length);
        
        // バッファが空でないか確認
        if (buffer.length === 0) {
          console.error("Temp file is empty");
          await fs.unlink(tempFile);
          return null;
        }
        
        await fs.unlink(tempFile); // 一時ファイルを削除
        return buffer;
      } catch (error) {
        console.error("Failed to read temp file:", error);
        // 一時ファイルが存在する場合は削除を試みる
        try {
          await fs.unlink(tempFile);
        } catch {}
        return null;
      }
    } catch (error) {
      console.error("Failed to get image from clipboard:", error);
      return null;
    }
  }

  async getImageInfo(
    filePath: string
  ): Promise<{ width: number; height: number }> {
    const image = await Jimp.read(filePath);
    return {
      width: image.getWidth(),
      height: image.getHeight(),
    };
  }

  async resizeImage(imageBuffer: Buffer, newWidth: number): Promise<Buffer> {
    const image = await Jimp.read(imageBuffer);
    const aspectRatio = image.getHeight() / image.getWidth();
    const newHeight = Math.round(newWidth * aspectRatio);

    image.resize(newWidth, newHeight);

    return await image.getBufferAsync(Jimp.MIME_PNG);
  }

  async saveImage(
    imageBuffer: Buffer,
    filePath: string,
    format: string
  ): Promise<void> {
    const image = await Jimp.read(imageBuffer);

    // 拡張子に応じて保存
    switch (format) {
      case ".jpg":
      case ".jpeg":
        await image.quality(85).writeAsync(filePath);
        break;
      case ".png":
        await image.writeAsync(filePath);
        break;
      case ".gif":
        await image.writeAsync(filePath);
        break;
      case ".webp": {
        // Jimpはwebpをサポートしていないため、PNGとして保存
        const webpPath = filePath.replace(/\.webp$/i, ".png");
        await image.writeAsync(webpPath);
        // 本来はwebpに変換する処理が必要
        await fs.rename(webpPath, filePath);
        break;
      }
      default:
        await image.writeAsync(filePath);
    }
  }
}
