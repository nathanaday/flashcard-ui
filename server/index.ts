import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import setsRouter from './routes/sets.js';
import cardsRouter from './routes/cards.js';
import dpRouter from './routes/dp.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/sets', setsRouter);
app.use('/api', cardsRouter);
app.use('/api/dp', dpRouter);

const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
