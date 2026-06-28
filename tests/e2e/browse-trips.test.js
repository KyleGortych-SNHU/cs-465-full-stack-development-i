const request = require('supertest');
const { expect } = require('chai');

const makeApp = require('../helpers/testServer');
const db = require('../helpers/dbSetup');
const { makeToken } = require('../helpers/authToken');
const Trip = require('../../app_api/models/travlr');

const reefTrip = {
  code: 'REEF01',
  name: 'Reef & Sand Escape',
  length: '7 nights',
  start: '2026-09-01T00:00:00.000Z',
  resort: 'Bahari Beach Resort',
  perPerson: '1499',
  image: 'reef.jpg',
  description: 'Sun-soaked shores with reef diving.'
};

const alpineTrip = {
  code: 'ALPS02',
  name: 'Alpine Ridge Trek',
  length: '5 nights',
  start: '2026-12-10T00:00:00.000Z',
  resort: 'Hochberg Lodge',
  perPerson: '1899',
  image: 'alps.jpg',
  description: 'Guided high-altitude trekking and hot springs.'
};

describe('E2E: browsing trips', () => {
  let app;
  let token;

  before(async () => {
    await db.connect();
    app = makeApp();
    token = makeToken();
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  after(async () => {
    await db.closeDatabase();
  });

  it('reports nothing to browse before any trips exist', async () => {
    const res = await request(app).get('/api/trips');

    // Travlr list controllers vary: some return 200 [] on an empty catalogue,
    // others return 404. Accept either so this asserts "nothing to browse"
    // without over-fitting to one controller style.
    expect(res.status).to.be.oneOf([200, 404]);
    if (res.status === 200) {
      expect(res.body).to.be.an('array').that.is.empty;
    }
  });

  it('an admin adds trips and a visitor can then browse the full list', async () => {
    // Admin adds two trips through the JWT-protected endpoint...
    for (const trip of [reefTrip, alpineTrip]) {
      const created = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${token}`)
        .send(trip);
      expect(created.status).to.equal(201);
    }

    // ...and an unauthenticated visitor browses what's now on offer.
    const res = await request(app).get('/api/trips');

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array').with.lengthOf(2);

    const codes = res.body.map((t) => t.code);
    expect(codes).to.have.members(['REEF01', 'ALPS02']);
  });

  it('a visitor can open a single trip by its code', async () => {
    await Trip.create(reefTrip);

    const res = await request(app).get('/api/trips/REEF01');

    expect(res.status).to.equal(200);
    // controller returns a single-element array, matching the API suite
    expect(res.body[0]).to.include({
      code: 'REEF01',
      name: 'Reef & Sand Escape'
    });
  });

  it('returns 404 when browsing a code that does not exist', async () => {
    await Trip.create(reefTrip);

    const res = await request(app).get('/api/trips/NOPE99');

    expect(res.status).to.equal(404);
  });
});
