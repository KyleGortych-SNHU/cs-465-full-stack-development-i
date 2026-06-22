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
  it('validates a complete trip with no errors', () => {
    expect(new Trip(completeTrip).validateSync()).to.equal(undefined);
  });

  it('flags every mandatory field when empty', () => {
    const err = new Trip({}).validateSync();
    ['code', 'name', 'length', 'start', 'resort', 'perPerson', 'image', 'description']
      .forEach((field) => expect(err.errors, field).to.have.property(field));
  });

  it('rejects an unparseable start date', () => {
    const err = new Trip({ ...completeTrip, start: 'not-a-date' }).validateSync();
    expect(err.errors).to.have.property('start');
  });
});
