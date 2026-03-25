#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const LIGHTPANDA_VERSION = 'nightly';
const BINARY_DIR = path.join(__dirname, 'bin');
const BINARY_PATH = path.join(BINARY_DIR, 'lightpanda');

function getPlatform() {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === 'darwin') {
    return arch === 'arm64' ? 'lightpanda-aarch64-macos' : 'lightpanda-x86_64-macos';
  } else if (platform === 'linux') {
    return arch === 'arm64' ? 'lightpanda-aarch64-linux' : 'lightpanda-x86_64-linux';
  } else if (platform === 'win32') {
    throw new Error('Windows is not supported yet. Please use WSL2.');
  } else {
    throw new Error(`Unsupported platform: ${platform}-${arch}`);
  }
}

function downloadBinary() {
  return new Promise((resolve, reject) => {
    const binaryName = getPlatform();
    const url = `https://github.com/lightpanda-io/browser/releases/download/${LIGHTPANDA_VERSION}/${binaryName}`;

    console.error(`Downloading Lightpanda binary for ${process.platform}-${process.arch}...`);
    console.error(`URL: ${url}`);

    // Create bin directory if it doesn't exist
    if (!fs.existsSync(BINARY_DIR)) {
      fs.mkdirSync(BINARY_DIR, { recursive: true });
    }

    const file = fs.createWriteStream(BINARY_PATH);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            reject(new Error(`Download failed with status ${redirectResponse.statusCode}`));
            return;
          }

          const totalSize = parseInt(redirectResponse.headers['content-length'], 10);
          let downloadedSize = 0;

          redirectResponse.on('data', (chunk) => {
            downloadedSize += chunk.length;
            const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
            process.stderr.write(`\rProgress: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
          });

          redirectResponse.pipe(file);

          file.on('finish', () => {
            file.close();
            console.error('\nDownload complete!');

            // Make binary executable
            fs.chmodSync(BINARY_PATH, 0o755);
            console.error('Binary installed successfully.');
            resolve();
          });
        }).on('error', reject);
      } else if (response.statusCode === 200) {
        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloadedSize = 0;

        response.on('data', (chunk) => {
          downloadedSize += chunk.length;
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stderr.write(`\rProgress: ${progress}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.error('\nDownload complete!');

          // Make binary executable
          fs.chmodSync(BINARY_PATH, 0o755);
          console.error('Binary installed successfully.');
          resolve();
        });
      } else {
        reject(new Error(`Download failed with status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlinkSync(BINARY_PATH);
      reject(err);
    });

    file.on('error', (err) => {
      fs.unlinkSync(BINARY_PATH);
      reject(err);
    });
  });
}

async function ensureBinary() {
  if (fs.existsSync(BINARY_PATH)) {
    return BINARY_PATH;
  }

  try {
    await downloadBinary();
    return BINARY_PATH;
  } catch (error) {
    console.error('Failed to download Lightpanda binary:', error.message);
    throw error;
  }
}

module.exports = { ensureBinary, BINARY_PATH };

// Allow running directly for testing
if (require.main === module) {
  ensureBinary().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}