#!/usr/bin/env node

const { spawn } = require('child_process');
const { ensureBinary } = require('./download');

async function main() {
  try {
    // Ensure binary is downloaded
    const binaryPath = await ensureBinary();

    // Start lightpanda mcp process
    const lightpanda = spawn(binaryPath, ['mcp'], {
      stdio: 'inherit', // Pass through stdin/stdout/stderr
      env: process.env,
    });

    // Forward signals
    process.on('SIGTERM', () => lightpanda.kill('SIGTERM'));
    process.on('SIGINT', () => lightpanda.kill('SIGINT'));

    // Exit with same code as lightpanda
    lightpanda.on('exit', (code) => {
      process.exit(code || 0);
    });

    lightpanda.on('error', (err) => {
      console.error('Failed to start Lightpanda:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();