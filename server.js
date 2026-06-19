const express = require('express');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');
require('dotenv').config();

const PORT = Number(process.env.PORT || 3000);

let isFirebaseConfigured = false;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    isFirebaseConfigured = true;
    console.log('Firebase initialized.');
  } catch (error) {
    console.error('Failed to initialize Firebase admin:', error.message || error);
  }
}

if (!isFirebaseConfigured) {
  console.warn('Firebase configuration is missing, incomplete, or invalid.');
}

const db = isFirebaseConfigured ? admin.firestore() : null;

const app = express();
app.use(express.json({ limit: '1mb' }));

function convertTimestamps(data) {
  if (!data) return data;
  const result = { ...data };
  for (const key in result) {
    if (result[key] && typeof result[key].toDate === 'function') {
      result[key] = result[key].toDate();
    }
  }
  return result;
}

const users = {
  async findOne(query) {
    if (!db) throw new Error('Database not initialized');
    if (query.email) {
      const doc = await db.collection('users').doc(query.email).get();
      if (!doc.exists) return null;
      return convertTimestamps(doc.data());
    }
    let ref = db.collection('users');
    for (const key in query) {
      ref = ref.where(key, '==', query[key]);
    }
    const snap = await ref.limit(1).get();
    if (snap.empty) return null;
    return convertTimestamps(snap.docs[0].data());
  },
  async insertOne(doc) {
    if (!db) throw new Error('Database not initialized');
    const docRef = db.collection('users').doc(doc.email);
    const snap = await docRef.get();
    if (snap.exists) {
      const err = new Error('Duplicate key');
      err.code = 11000;
      throw err;
    }
    await docRef.set(doc);
    return { insertedId: doc.email };
  },
  async updateOne(query, update) {
    if (!db) throw new Error('Database not initialized');
    if (!query.email) {
      const user = await this.findOne(query);
      if (!user) return { matchedCount: 0, modifiedCount: 0 };
      query = { email: user.email };
    }
    const docRef = db.collection('users').doc(query.email);
    if (update.$set) {
      await docRef.set(update.$set, { merge: true });
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: 1, modifiedCount: 0 };
  },
  async createIndex() {
    return true;
  }
};

const sessions = {
  async findOne(query) {
    if (!db) throw new Error('Database not initialized');
    if (query.token) {
      const doc = await db.collection('sessions').doc(query.token).get();
      if (!doc.exists) return null;
      return convertTimestamps(doc.data());
    }
    let ref = db.collection('sessions');
    for (const key in query) {
      ref = ref.where(key, '==', query[key]);
    }
    const snap = await ref.limit(1).get();
    if (snap.empty) return null;
    return convertTimestamps(snap.docs[0].data());
  },
  async insertOne(doc) {
    if (!db) throw new Error('Database not initialized');
    await db.collection('sessions').doc(doc.token).set(doc);
    return { insertedId: doc.token };
  },
  async deleteOne(query) {
    if (!db) throw new Error('Database not initialized');
    if (query.token) {
      await db.collection('sessions').doc(query.token).delete();
      return { deletedCount: 1 };
    }
    let ref = db.collection('sessions');
    for (const key in query) {
      ref = ref.where(key, '==', query[key]);
    }
    const snap = await ref.get();
    let deletedCount = 0;
    const batch = db.batch();
    snap.docs.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });
    await batch.commit();
    return { deletedCount };
  },
  async updateOne(query, update) {
    if (!db) throw new Error('Database not initialized');
    if (!query.token) {
      const session = await this.findOne(query);
      if (!session) return { matchedCount: 0, modifiedCount: 0 };
      query = { token: session.token };
    }
    const docRef = db.collection('sessions').doc(query.token);
    if (update.$set) {
      await docRef.set(update.$set, { merge: true });
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: 1, modifiedCount: 0 };
  },
  async createIndex() {
    return true;
  }
};

let readyPromise = null;
let dbReady = false;
let dbInitError = null;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

function safeUser(doc) {
  if (!doc) return null;
  return {
    email: doc.email,
    name: doc.name,
    shuffle: Array.isArray(doc.shuffle) ? doc.shuffle : [],
    progress: doc.progress || {},
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function ensureReady() {
  if (dbReady) return true;
  if (!readyPromise) {
    readyPromise = (async () => {
      try {
        if (!isFirebaseConfigured) {
          throw new Error('Firebase environment variables are missing or incomplete.');
        }
        await db.collection('_health_check').limit(1).get();
        dbReady = true;
        dbInitError = null;
        console.log('Firebase Firestore connected.');
        return true;
      } catch (error) {
        dbReady = false;
        dbInitError = error;
        console.error('Firebase Firestore connection failed. Error:', error.message || error);
        throw error;
      } finally {
        readyPromise = null;
      }
    })();
  }
  return readyPromise;
}

async function requireDb(res) {
  try {
    await ensureReady();
    return true;
  } catch (error) {
    if (res) {
      res.status(503).json({
        error: 'Database unavailable',
        detail: error.message || 'Connection failed',
      });
    }
    return false;
  }
}

async function requireSession(req, res) {
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Missing session token' });
    return null;
  }

  const session = await sessions.findOne({ token });
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }

  const user = await users.findOne({ email: session.email });
  if (!user) {
    await sessions.deleteOne({ token });
    res.status(401).json({ error: 'User not found' });
    return null;
  }

  return { token, user: safeUser(user) };
}

async function issueSession(user) {
  const token = randomToken();
  await sessions.insertOne({
    token,
    email: user.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return token;
}

app.post('/api/register', async (req, res) => {
  try {
    if (!(await requireDb(res))) return;
    const name = String(req.body?.name || '').trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: 'Mật khẩu tối thiểu 4 ký tự' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    const exists = await users.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }

    const totalQuestions = Number(req.body?.totalQuestions || 0);
    const incomingShuffle = Array.isArray(req.body?.shuffle)
      ? req.body.shuffle.map(Number).filter(Number.isInteger)
      : [];
    const shuffle = incomingShuffle.length === totalQuestions && totalQuestions > 0
      ? [...new Set(incomingShuffle)]
      : [...Array(totalQuestions).keys()];

    const doc = {
      email,
      name,
      passwordHash: hashPassword(password),
      shuffle,
      progress: {
        completed_pages: [],
        page_scores: {},
        last_results: {},
        page_answers: {},
        last_page: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await users.insertOne(doc);
    const token = await issueSession(doc);
    return res.status(201).json({ token, user: safeUser(doc) });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: 'Email đã được sử dụng' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Không thể đăng ký lúc này' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    if (!(await requireDb(res))) return;
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const user = await users.findOne({
      email,
      passwordHash: hashPassword(password),
    });
    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng!' });
    }

    const token = await issueSession(user);
    return res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Không thể đăng nhập lúc này' });
  }
});

app.get('/api/session', async (req, res) => {
  try {
    if (!(await requireDb(res))) return;
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return res.status(401).json({ error: 'Missing session token' });

    const session = await sessions.findOne({ token });
    if (!session) return res.status(401).json({ error: 'Invalid or expired session' });

    const user = await users.findOne({ email: session.email });
    if (!user) return res.status(401).json({ error: 'User not found' });

    await sessions.updateOne({ token }, { $set: { updatedAt: new Date() } });
    return res.json({ token, user: safeUser(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Không thể tải phiên đăng nhập' });
  }
});

app.post('/api/logout', async (req, res) => {
  try {
    if (!(await requireDb(res))) return;
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return res.status(204).end();
    await sessions.deleteOne({ token });
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Không thể đăng xuất lúc này' });
  }
});

app.get('/api/progress', async (req, res) => {
  try {
    if (!(await requireDb(res))) return;
    const session = await requireSession(req, res);
    if (!session) return;
    return res.json({ progress: session.user.progress || {} });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Không thể tải tiến độ' });
  }
});

app.put('/api/progress', async (req, res) => {
  try {
    if (!(await requireDb(res))) return;
    const session = await requireSession(req, res);
    if (!session) return;

    const progress = req.body?.progress;
    if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
      return res.status(400).json({ error: 'Progress payload không hợp lệ' });
    }

    const normalized = {
      completed_pages: Array.isArray(progress.completed_pages)
        ? [...new Set(progress.completed_pages.map(Number).filter(Number.isInteger))]
        : [],
      page_scores: progress.page_scores && typeof progress.page_scores === 'object' && !Array.isArray(progress.page_scores)
        ? progress.page_scores
        : {},
      last_results: progress.last_results && typeof progress.last_results === 'object' && !Array.isArray(progress.last_results)
        ? progress.last_results
        : {},
      page_answers: progress.page_answers && typeof progress.page_answers === 'object' && !Array.isArray(progress.page_answers)
        ? progress.page_answers
        : {},
      last_page: Number.isInteger(progress.last_page) ? progress.last_page : 0,
    };

    await users.updateOne(
      { email: session.user.email },
      {
        $set: {
          progress: normalized,
          updatedAt: new Date(),
        },
      }
    );

    return res.json({ progress: normalized });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Không thể lưu tiến độ' });
  }
});

app.get('/health', async (_req, res) => {
  try {
    await ensureReady();
    await db.collection('_health_check').limit(1).get();
    res.json({ ok: true, database: 'firestore' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'firestore', error: 'Database unavailable', detail: error.message || String(error) });
  }
});

app.get('/', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/questions.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.sendFile(path.join(__dirname, 'questions.js'));
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
