import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const app = express();
const PORT = 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use /tmp on Vercel, otherwise use local public/uploads
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'public/uploads');

if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

// Conditionally serve from /tmp on Vercel
if (process.env.VERCEL) {
  app.use('/public/uploads', express.static(uploadDir));
}

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});