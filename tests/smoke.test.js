import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

function waitForOutput(child, text, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${text}`)), timeoutMs);
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes(text)) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on('exit', (code) => {
      clearTimeout(timer);
      if (code !== null && code !== 0) reject(new Error(`Server exited with ${code}`));
    });
  });
}

test('minimal Express server responds to health request', async () => {
  const child = spawn(process.execPath, ['demos/03-minimal-express/server.js'], {
    env: { ...process.env, PORT: '3903' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    await waitForOutput(child, 'Minimal server');
    const response = await fetch('http://localhost:3903/api/health');
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.status, 'ok');
  } finally {
    child.kill('SIGTERM');
  }
});
