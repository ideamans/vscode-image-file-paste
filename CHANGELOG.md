# Change Log

All notable changes to the "vscode-image-file-paste" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.7] - 2025-07-06

### Fixed

- Improved Windows clipboard handling with more detailed debugging
- Enhanced PowerShell script execution for better compatibility
- Added detailed error logging for clipboard operations
- Fixed issue where clipboard image was not detected on some Windows systems

### Changed

- Refactored Windows clipboard implementation to use more reliable methods
- Added diagnostic output to help troubleshoot clipboard issues

## [0.1.3] - 2025-07-06

### Changed

- Renamed extension from "vscode-image-paste" to "vscode-image-file-paste" for clarity
- Updated display name to "Image File Paste"
- Improved documentation with animated GIF demonstration
- Enhanced README files with absolute URLs for images
- Code formatting improvements

### Fixed

- Fixed test suite to use correct extension ID
- Minor code style improvements based on linter suggestions

## [0.1.2] - 2025-07-06

### Added

- Demo GIF in README files
- Better project structure documentation

### Fixed

- Extension ID in tests

## [0.1.1] - 2025-07-05

### Added

- Keywords for better marketplace discoverability
- Icon field in package.json
- Categories: "Other" and "Visualization"

### Fixed

- Package configuration for marketplace publishing

## [0.0.1] - 2025-07-05

### Initial Release

#### Features

- **Direct Image Paste**: Paste images from clipboard directly into open image files using `Ctrl+V` / `Cmd+V`
- **Paste with Resize**: Right-click context menu option to paste with custom width (maintains aspect ratio)
- **Format Conversion**: Automatically converts image format based on target file extension
- **Image Preview Support**: Works with both text editor view and image preview
- **Undo Support**: Restore previous image with `Ctrl+Z` / `Cmd+Z`
- **Multi-platform**: Supports macOS, Windows, and Linux

#### Supported Formats

- PNG
- JPEG/JPG (quality: 85)
- GIF
- WebP (limited support)

#### Documentation

- English and Japanese README files
- Comprehensive development guide
- MIT License

## [Unreleased]

### Todo

- Add configuration settings for JPEG quality
- Support for more image formats
- Batch paste functionality
- Better error handling for clipboard failures
