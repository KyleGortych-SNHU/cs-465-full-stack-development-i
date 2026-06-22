const request = require('supertest');
const { expect } = require('chai');

const makeApp = require('../../helpers/testServer');
const db = require('../../helpers/dbSetup');
const User = require('../../../app_api/models/user');

describe('Auth API routes', () => {
  let app;

  before(async () => { await db.connect(); app = makeApp(); });
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

    it('returns 401 for a wrong password', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'login@travlr.test', password: 'WrongPass'
      });
      expect(res.status).to.equal(401);
    });
  });
});
