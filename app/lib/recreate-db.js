const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
console.log('Recreating database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create a temporary table with the new schema
  db.serialize(() => {
    // Drop existing triggers and temporary table
    db.run('DROP TRIGGER IF EXISTS update_assets_timestamp', (err) => {
      if (err) {
        console.error('Error dropping trigger:', err);
        return;
      }
      console.log('Dropped existing trigger');

      db.run('DROP TABLE IF EXISTS assets_new', (err) => {
        if (err) {
          console.error('Error dropping temporary table:', err);
          return;
        }
        console.log('Dropped temporary table if it existed');

        // Create temporary table with new schema
        db.run(`
          CREATE TABLE assets_new (
            assetId TEXT PRIMARY KEY,
            assetName TEXT NOT NULL,
            assetType TEXT NOT NULL,
            assignedTo TEXT,
            status TEXT NOT NULL,
            location TEXT,
            purchaseDate TEXT,
            lastMaintenance TEXT,
            nextMaintenance TEXT,
            condition TEXT,
            notes TEXT,
            employeeName TEXT,
            employeeId TEXT,
            section TEXT,
            employeeLevel TEXT,
            idDocument TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assignedTo) REFERENCES departments(departmentId)
          )
        `, (err) => {
          if (err) {
            console.error('Error creating new table:', err);
            return;
          }
          console.log('Created new table with updated schema');

          // Copy data from old table to new table
          db.run(`
            INSERT INTO assets_new (
              assetId, assetName, assetType, assignedTo,
              status, location, purchaseDate, lastMaintenance,
              nextMaintenance, condition, notes,
              createdAt, updatedAt
            )
            SELECT 
              assetId, assetName, assetType, assignedTo,
              status, location, purchaseDate, lastMaintenance,
              nextMaintenance, condition, notes,
              createdAt, updatedAt
            FROM assets
          `, (err) => {
            if (err) {
              console.error('Error copying data:', err);
              return;
            }
            console.log('Copied data to new table');

            // Drop old table
            db.run('DROP TABLE assets', (err) => {
              if (err) {
                console.error('Error dropping old table:', err);
                return;
              }
              console.log('Dropped old table');

              // Rename new table to original name
              db.run('ALTER TABLE assets_new RENAME TO assets', (err) => {
                if (err) {
                  console.error('Error renaming table:', err);
                  return;
                }
                console.log('Renamed new table to assets');

                // Create new trigger
                db.run(`
                  CREATE TRIGGER update_assets_timestamp 
                  AFTER UPDATE ON assets
                  BEGIN
                    UPDATE assets SET updatedAt = CURRENT_TIMESTAMP WHERE assetId = NEW.assetId;
                  END;
                `, (err) => {
                  if (err) {
                    console.error('Error creating new trigger:', err);
                    return;
                  }
                  console.log('Created new trigger');

                  // Close the database
                  db.close((err) => {
                    if (err) {
                      console.error('Error closing database:', err);
                    } else {
                      console.log('Database recreation completed successfully');
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}); 