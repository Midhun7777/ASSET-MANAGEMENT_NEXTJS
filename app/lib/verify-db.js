const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
console.log('Verifying database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  
  // Get table info
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      return;
    }
    console.log('Tables in database:', tables.map(t => t.name).join(', '));
    
    // Get schema for assets table
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='assets'", [], (err, schema) => {
      if (err) {
        console.error('Error getting schema:', err);
        return;
      }
      if (schema) {
        console.log('\nSchema for assets table:');
        console.log(schema.sql);
      } else {
        console.log('\nAssets table not found');
      }
      
      // Close the database
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
      });
    });
  });
}); 