import db from './connection';

// Function to check data types of sample values
function checkDataTypes(tableName) {
  const stmt = db.prepare(`SELECT * FROM "${tableName}" LIMIT 100`);
  const rows = stmt.all();

  if (rows.length === 0) {
    console.log('No data found in the table.');
    return;
  }

  const columns = Object.keys(rows[0]);
  const types = {};

  rows.forEach((row) => {
    columns.forEach((column) => {
      let value = row[column];
      let valueType = typeof value;

      // Further classify numbers as integer or float
      if (valueType === 'number') {
        if (Number.isInteger(value)) {
          valueType = 'integer';
        } else {
          valueType = 'float';
        }
      }

      // Check for date/time formats
      if (valueType === 'string' && column.toLowerCase().includes('date')) {
        // Simple regex to check for common date/time formats
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
          valueType = 'datetime';
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          valueType = 'date';
        }
      }

      if (!types[column]) {
        types[column] = {};
      }
      if (!types[column][valueType]) {
        types[column][valueType] = [];
      }
      types[column][valueType].push(value);
    });
  });

  Object.keys(types).forEach((column) => {
    console.log(`Column: ${column}`);
    Object.keys(types[column]).forEach((type) => {
      console.log(`  Type: ${type}, Count: ${types[column][type].length}`);
      console.log(`  Sample Values: ${types[column][type].slice(0, 5).join(', ')}`);
    });
  });
}

// Replace 'your_table_name' with the actual name of your table
const tableName = 'audio-tracks';
checkDataTypes(tableName);
