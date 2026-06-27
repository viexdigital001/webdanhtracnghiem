const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://root:viexstudio123456@ac-znxggvf-shard-00-00.pea39t7.mongodb.net:27017,ac-znxggvf-shard-00-01.pea39t7.mongodb.net:27017,ac-znxggvf-shard-00-02.pea39t7.mongodb.net:27017/demo_app?ssl=true&replicaSet=atlas-4x6mot-shard-0&authSource=admin&appName=Cluster0';

const DB_NAME = 'demo_app';

let client = null;
let db = null;

async function connect() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

function getDb() {
  if (!db) throw new Error('Chưa kết nối cơ sở dữ liệu MongoDB');
  return db;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = { connect, getDb, close };
