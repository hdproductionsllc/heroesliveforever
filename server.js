const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure required directories exist
const dirs = [
  'uploads',
  'output',
  'output/jsx',
  'output/pdf',
  'output/html'
];
for (const dir of dirs) {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const apiRoutes = require('./src/routes/api');
const exportRoutes = require('./src/routes/exports');

app.use('/api', apiRoutes);
app.use('/api/exports', exportRoutes);

app.listen(PORT, () => {
  console.log(`\n  Heroes Live Forever — Design Tool`);
  console.log(`  http://localhost:${PORT}\n`);
});
