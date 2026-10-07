// Starts the Expo web dev server on the port given by the PORT env var
// (used by the Claude preview, which picks a free port). Falls back to 8081.
const { spawn } = require('child_process');

const port = process.env.PORT || '8081';
const child = spawn('npx', ['expo', 'start', '--web', '--port', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
