import fs from 'fs';
import { createApp } from './app';
import { config } from './config/env';

// Ensure storage directories exist before the server starts accepting requests.
for (const dir of [config.uploadsDir, config.outputsDir, config.historyDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const app = createApp();

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[PixelPilot AI] backend listening on http://localhost:${config.port}`);
});
