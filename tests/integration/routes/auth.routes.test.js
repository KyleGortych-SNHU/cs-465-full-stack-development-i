const request = require('supertest');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');

const makeApp = require('../../helpers/testServer');
const db = require('../../helpers/dbSetup');
const User = require('../../../app_api/models/user');

describe('Auth API routes', () => {
  let app;

  before(async () => {
    await db.connect();
    await User.init();
    app = makeApp();
  });
  afterEach(async () => { await db.clearDatabase(); });
  after(async () => { await db.closeDatabase(); });

  describe('POST /api/register', () => {
    it('returns 400 when required fields are missing', async () => {
      const res = await request(app).post('/api/register').send({ email: 'a@b.com' });
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('creates a user with a hashed password and returns a JWT', async () => {
      const res = await request(app).post('/api/register').send({
        name: 'Reef Tester', email: 'reef@travlr.test', password: 'Sand123!'
      });

      expect(res.status).to.equal(200);
      const token = res.body.token || res.body;
      expect(token).to.be.a('string').with.length.greaterThan(0);

      const saved = await User.findOne({ email: 'reef@travlr.test' });
      expect(saved).to.not.equal(null);
      expect(saved.hash).to.be.a('string').and.not.equal('Sand123!');
    });

    it('returns 409 when the email is already registered', async () => {
      const payload = { name: 'Dup', email: 'dup@travlr.test', password: 'Sand123!' };
      await request(app).post('/api/register').send(payload);
      const res = await request(app).post('/api/register').send(payload);
      expect(res.status).to.equal(409);
    });
  });

  describe('POST /api/register (roles)', () => {
    it('defaults to role "user" when no admin code is given', async () => {
      const res = await request(app).post('/api/register').send({
        name: 'Plain User', email: 'plain@travlr.test', password: 'Sand123!'
      });
      expect(res.status).to.equal(200);

      const saved = await User.findOne({ email: 'plain@travlr.test' });
      expect(saved.role).to.equal('user');

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.role).to.equal('user');
    });

    it('creates an admin when the correct admin code is supplied', async () => {
      const res = await request(app).post('/api/register').send({
        name: 'Admin User',
        email: 'admin2@travlr.test',
        password: 'Sand123!',
        adminKey: process.env.ADMIN_REGISTRATION_KEY,
      });
      expect(res.status).to.equal(200);

      const saved = await User.findOne({ email: 'admin2@travlr.test' });
      expect(saved.role).to.equal('admin');

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.role).to.equal('admin');
    });

    it('rejects an incorrect admin code with 403 and creates no user', async () => {
      const res = await request(app).post('/api/register').send({
        name: 'Bad Admin',
        email: 'bad@travlr.test',
        password: 'Sand123!',
        adminKey: 'definitely-wrong',
      });
      expect(res.status).to.equal(403);

      const saved = await User.findOne({ email: 'bad@travlr.test' });
      expect(saved).to.equal(null);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const u = new User({ name: 'Login Tester', email: 'login@travlr.test' });
      u.setPassword('Sand123!');
      await u.save();
    });

    it('returns 400 when fields are missing', async () => {
      const res = await request(app).post('/api/login').send({ email: 'login@travlr.test' });
      expect(res.status).to.equal(400);
    });

    it('returns 200 and a token for valid credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'login@travlr.test', password: 'Sand123!'
      });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token').that.is.a('string');
    });

    it('embeds the user role in the issued token', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'login@travlr.test', password: 'Sand123!'
      });
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.role).to.equal('user');
    });

    it('returns 401 for a wrong password', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'login@travlr.test', password: 'WrongPass'
      });
      expect(res.status).to.equal(401);
    });
  });
});
