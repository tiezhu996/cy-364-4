const { Client } = require('pg');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'app',
  user: process.env.DB_USER || 'app',
  password: process.env.DB_PASSWORD || 'app_pwd',
};

const MAX_RETRIES = 30;
const RETRY_DELAY = 2000;

async function waitForDatabase() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const client = new Client(config);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      console.log('PostgreSQL is ready!');
      process.exit(0);
    } catch (err) {
      console.log(`PostgreSQL is unavailable - sleeping (attempt ${i + 1}/${MAX_RETRIES})`);
      if (i === MAX_RETRIES - 1) {
        console.error(`Failed to connect to PostgreSQL after ${MAX_RETRIES} attempts`);
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

waitForDatabase();
