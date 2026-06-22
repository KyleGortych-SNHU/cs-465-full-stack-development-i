const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../../../app_api/middleware/authenticateJWT');

function mockRes() {
  return {
    statusCode: null,
    sendStatus(code) { this.statusCode = code; return this; },
  };
}

describe('authenticateJWT middleware', () => {
  it('responds 401 when Authorization header is missing', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = sinon.spy();

    authenticateJWT(req, res, next);

    expect(res.statusCode).to.equal(401);
    expect(next.called).to.equal(false);
  });

  it('responds 401 when token is invalid', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } };
    const res = mockRes();
    const next = sinon.spy();

    authenticateJWT(req, res, next);

    expect(res.statusCode).to.equal(401);
    expect(next.called).to.equal(false);
  });

  it('calls next() and sets req.auth for a valid token', () => {
    const token = jwt.sign(
      { _id: '1', email: 'a@b.com', name: 'A' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = sinon.spy();

    authenticateJWT(req, res, next);

    expect(next.calledOnce).to.equal(true);
    expect(req.auth).to.include({ email: 'a@b.com' });
  });
});
