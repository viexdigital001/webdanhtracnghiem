const express = require('express');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();
const { connect, getDb } = require('./db');

const PORT = Number(process.env.PORT || 3000);

let dbReady = false;
let dbInitError = null;

async function ensureDbReady() {
  if (dbReady) return true;
  try {
    await connect();
    dbReady = true;
    dbInitError = null;
    console.log('Kết nối MongoDB thành công.');
    return true;
  } catch (error) {
    dbReady = false;
    dbInitError = error;
    console.error('Kết nối MongoDB thất bại:', error.message || error);
    throw error;
  }
}

async function requireDb(res) {
  try {
    await ensureDbReady();
    return true;
  } catch (error) {
    if (res) {
      res.status(503).json({
        error: 'Cơ sở dữ liệu không khả dụng',
        detail: error.message || 'Kết nối thất bại',
      });
    }
    return false;
  }
}

const app = express();
app.use(express.json({ limit: '1mb' }));

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

const users = {
  async findOne(query) {
    const mdb = getDb();
    if (query.email) {
      const doc = await mdb.collection('users').findOne({ email: query.email });
      if (!doc) return null;
      return doc;
    }
    const doc = await mdb.collection('users').findOne(query);
    return doc || null;
  },
  async insertOne(doc) {
    const mdb = getDb();
    const result = await mdb.collection('users').insertOne(doc);
    return { insertedId: result.insertedId };
  },
  async updateOne(query, update) {
    const mdb = getDb();
    if (!query.email) {
      const user = await this.findOne(query);
      if (!user) return { matchedCount: 0, modifiedCount: 0 };
      query = { email: user.email };
    }
    await mdb.collection('users').updateOne(query, update, { upsert: false });
    return { matchedCount: 1, modifiedCount: 1 };
  },
  async createIndex() {
    const mdb = getDb();
    await mdb.collection('users').createIndex({ email: 1 }, { unique: true });
    return true;
  }
};

const sessions = {
  async findOne(query) {
    const mdb = getDb();
    let filter = {};
    if (query.token) {
      filter.token = query.token;
    }
    for (const key in query) {
      filter[key] = query[key];
    }
    const doc = await mdb.collection('sessions').findOne(filter);
    return doc || null;
  },
  async insertOne(doc) {
    const mdb = getDb();
    const result = await mdb.collection('sessions').insertOne(doc);
    return { insertedId: result.insertedId };
  },
  async deleteOne(query) {
    const mdb = getDb();
    if (query.token) {
      const result = await mdb.collection('sessions').deleteOne({ token: query.token });
      return { deletedCount: result.deletedCount };
    }
    const result = await mdb.collection('sessions').deleteMany(query);
    return { deletedCount: result.deletedCount };
  },
  async updateOne(query, update) {
    const mdb = getDb();
    let filter = {};
    if (query.token) {
      filter.token = query.token;
    }
    for (const key in query) {
      filter[key] = query[key];
    }
    if (update.$set) {
      await mdb.collection('sessions').updateOne(filter, { $set: update.$set });
      return { matchedCount: 1, modifiedCount: 1 };
    }
    return { matchedCount: 1, modifiedCount: 0 };
  },
  async createIndex() {
    const mdb = getDb();
    await mdb.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await mdb.collection('sessions').createIndex({ email: 1 });
    return true;
  }
};

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

async function requireSession(req, res) {
  const auth = String(req.headers.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Thiếu mã phiên đăng nhập' });
    return null;
  }

  const session = await sessions.findOne({ token });
  if (!session) {
    res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });
    return null;
  }

  const user = await users.findOne({ email: session.email });
  if (!user) {
    await sessions.deleteOne({ token });
    res.status(401).json({ error: 'Không tìm thấy người dùng' });
    return null;
  }

  return { token, user: safeUser(user) };
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
    if (!token) return res.status(401).json({ error: 'Thiếu mã phiên đăng nhập' });

    const session = await sessions.findOne({ token });
    if (!session) return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' });

    const user = await users.findOne({ email: session.email });
    if (!user) return res.status(401).json({ error: 'Không tìm thấy người dùng' });

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
      return res.status(400).json({ error: 'Dữ liệu tiến độ không hợp lệ' });
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
    await ensureDbReady();
    const mdb = getDb();
    await mdb.collection('users').find().limit(1).toArray();
    res.json({ ok: true, database: 'mongodb' });
  } catch (error) {
    res.status(503).json({ ok: false, database: 'mongodb', error: 'Cơ sở dữ liệu không khả dụng', detail: error.message || String(error) });
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

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên http://localhost:${PORT}`);
  });
}
