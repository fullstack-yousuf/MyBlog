import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => console.log('Connected!'))
  .catch(err => console.error('Connection error', err));
