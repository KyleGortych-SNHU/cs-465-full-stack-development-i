const request = require('supertest');
const { expect } = require('chai');

const makeApp = require('../../helpers/testServer');
const db = require('../../helpers/dbSetup');
const { makeToken } = require('../../helpers/authToken');
const Trip = require('../../../app_api/models/travlr');

const sampleTrip = {
  code: 'REEF01',
  name: 'Reef & Sand Escape',
  length: '7 nights',
  start: '2026-09-01T00:00:00.000Z',
  resort: 'Bahari Beach Resort',
  perPerson: '1499',
  image: 'reef.jpg',
  description: 'Sun-soaked shores with reef diving.'
};

describe('Trips API routes', () => {
  let app;
  let adminToken;
  let userToken;

  before(async () => {
    await db.connect();
    app = makeApp();
    adminToken = makeToken();
    userToken = makeToken({ role: 'user', email: 'user@travlr.test' });
  });
  afterEach(async () => { await db.clearDatabase(); });
  after(async () => { await db.closeDatabase(); });

  describe('GET /api/trips', () => {
    it('returns 200 and an array of trips', async () => {
      await Trip.create(sampleTrip);
      const res = await request(app).get('/api/trips');

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(1);
      expect(res.body[0]).to.include({ code: 'REEF01' });
    });
  });

  describe('GET /api/trips/:tripCode', () => {
    it('returns the matching trip', async () => {
      await Trip.create(sampleTrip);
      const res = await request(app).get('/api/trips/REEF01');

      expect(res.status).to.equal(200);
      expect(res.body[0]).to.include({ name: 'Reef & Sand Escape' });
    });

    it('returns 404 for an unknown code', async () => {
      const res = await request(app).get('/api/trips/NOPE99');
      expect(res.status).to.equal(404);
    });
  });

  describe('POST /api/trips (admin only)', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).post('/api/trips').send(sampleTrip);
      expect(res.status).to.equal(401);
    });

    it('returns 403 for a non-admin token', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${userToken}`)
        .send(sampleTrip);
      expect(res.status).to.equal(403);
      expect(await Trip.countDocuments()).to.equal(0);
    });

    it('returns 201 and persists the trip with an admin token', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sampleTrip);

      expect(res.status).to.equal(201);
      expect(await Trip.countDocuments()).to.equal(1);
    });
  });

  describe('PUT /api/trips/:tripCode (admin only)', () => {
    it('returns 401 without a token', async () => {
      const res = await request(app).put('/api/trips/REEF01').send(sampleTrip);
      expect(res.status).to.equal(401);
    });

    it('returns 403 for a non-admin token', async () => {
      await Trip.create(sampleTrip);
      const res = await request(app)
        .put('/api/trips/REEF01')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...sampleTrip, name: 'Should Not Save' });

      expect(res.status).to.equal(403);
      const unchanged = await Trip.findOne({ code: 'REEF01' });
      expect(unchanged.name).to.equal('Reef & Sand Escape');
    });

    it('updates an existing trip with an admin token', async () => {
      await Trip.create(sampleTrip);
      const res = await request(app)
        .put('/api/trips/REEF01')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...sampleTrip, name: 'Reef & Sand DELUXE' });

      expect(res.status).to.be.oneOf([200, 201]);
      const updated = await Trip.findOne({ code: 'REEF01' });
      expect(updated.name).to.equal('Reef & Sand DELUXE');
    });
  });
});
