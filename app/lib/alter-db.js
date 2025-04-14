const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
console.log('Altering database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Add new columns to assets table
  const alterQueries = [
    'ALTER TABLE assets ADD COLUMN employeeName TEXT',
    'ALTER TABLE assets ADD COLUMN employeeId TEXT',
    'ALTER TABLE assets ADD COLUMN section TEXT',
    'ALTER TABLE assets ADD COLUMN employeeLevel TEXT',
    'ALTER TABLE assets ADD COLUMN idDocument TEXT'
  ];

  // Execute each ALTER TABLE query
  alterQueries.forEach((query, index) => {
    db.run(query, (err) => {
      if (err) {
        // If the column already exists, ignore the error
        if (err.message.includes('duplicate column name')) {
          console.log(`Column already exists: ${query.split(' ')[4]}`);
        } else {
          console.error(`Error executing query ${index + 1}:`, err);
        }
      } else {
        console.log(`Successfully added column: ${query.split(' ')[4]}`);
      }
    });
  });

  // Close the database
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database alteration completed');
    }
  });
}); 