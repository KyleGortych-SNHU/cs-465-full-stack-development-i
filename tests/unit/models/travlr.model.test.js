const { expect } = require('chai');
const Trip = require('../../../app_api/models/travlr');

const completeTrip = {
  code: 'REEF01',
  name: 'Reef & Sand Escape',
  length: '7 nights',
  start: new Date('2026-09-01'),
  resort: 'Bahari Beach Resort',
  perPerson: '1499',
  image: 'reef.jpg',
  description: 'Sun-soaked shores with reef diving.'
};

describe('Trip model', () => {
  it('validates a complete trip with no errors', async () => {
    const trip = new Trip(completeTrip);
    await trip.validate();
  });

  it('flags every mandatory field when empty', async () => {
    const trip = new Trip({});
    let err;
    try { await trip.validate(); } catch (e) { err = e; }
    expect(err).to.exist;
    expect(err.errors).to.have.property('name');
  });

  it('rejects an unparseable start date', async () => {
    let err;
    try {
      await new Trip({ ...completeTrip, start: 'not-a-date' }).validate();
    } catch (e) { err = e; }
    expect(err).to.exist;
    expect(err.errors).to.have.property('start');
  });
});
