const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const User = require('../../../app_api/models/user');

// in-memory tests no need for live MongoDB connection
describe('User model', () => {
  describe('setPassword / validPassword', () => {
    it('hashes the password (no plaintext stored) and validates correctly', () => {
      const u = new User({ name: 'Pat', email: 'pat@travlr.test' });
      u.setPassword('Sand123!');

      expect(u.salt).to.be.a('string').with.length.greaterThan(0);
      expect(u.hash).to.be.a('string').and.not.equal('Sand123!');
      expect(u.validPassword('Sand123!')).to.equal(true);
      expect(u.validPassword('WrongPass')).to.equal(false);
    });

    it('uses a fresh random salt each time (same password -> different hash)', () => {
      const a = new User(); a.setPassword('same');
      const b = new User(); b.setPassword('same');
      expect(a.salt).to.not.equal(b.salt);
      expect(a.hash).to.not.equal(b.hash);
    });
  });

  describe('generateJWT', () => {
    it('returns a token carrying _id, email, name and a future expiry', () => {
      const u = new User({ name: 'Pat', email: 'pat@travlr.test' });
      const decoded = jwt.verify(u.generateJWT(), process.env.JWT_SECRET);

      expect(decoded).to.include({ email: 'pat@travlr.test', name: 'Pat' });
      expect(decoded).to.have.property('exp');
      expect(decoded.exp).to.be.greaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('schema validation', () => {
    it('requires email and name', async () => {
      const u = new User();
      let err;
      try { await u.validate(); } catch (e) { err = e; }
      expect(err).to.exist;
      expect(err.errors).to.have.property('email');
      expect(err.errors).to.have.property('name');
    });
  });

});
