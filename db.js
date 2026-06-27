const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb+srv://root:123@cluster0.dzvcmsq.mongodb.net/?appName=Cluster0';

const DB_NAME = 'test';

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
