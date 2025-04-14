// This script initializes the database with the correct schema
const { execSync } = require('child_process');
const path = require('path');

console.log('Initializing database...');

try {
  // Run the TypeScript file using ts-node
  execSync('npx ts-node app/lib/init-db.ts', { stdio: 'inherit' });
  console.log('Database initialization completed successfully.');
} catch (error) {
  console.error('Error initializing database:', error);
  process.exit(1);
} 