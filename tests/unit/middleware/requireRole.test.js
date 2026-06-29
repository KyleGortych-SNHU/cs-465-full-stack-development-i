const { expect } = require('chai');
const sinon = require('sinon');
const requireRole = require('../../../app_api/middleware/requireRole');

function mockRes() {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  res.sendStatus = sinon.stub().returns(res);
  return res;
}

describe('requireRole middleware', () => {
  it('responds 401 when req.auth is missing', () => {
    const req = {};
    const res = mockRes();
    const next = sinon.stub();

    requireRole('admin')(req, res, next);

    expect(res.status.calledWith(401)).to.equal(true);
    expect(next.called).to.equal(false);
  });

  it('responds 403 when the role is not allowed', () => {
    const req = { auth: { role: 'user' } };
    const res = mockRes();
    const next = sinon.stub();

    requireRole('admin')(req, res, next);

    expect(res.status.calledWith(403)).to.equal(true);
    expect(next.called).to.equal(false);
  });

  it('calls next() when the role is allowed', () => {
    const req = { auth: { role: 'admin' } };
    const res = mockRes();
    const next = sinon.stub();

    requireRole('admin')(req, res, next);

    expect(next.calledOnce).to.equal(true);
    expect(res.status.called).to.equal(false);
  });

  it('supports multiple allowed roles', () => {
    const req = { auth: { role: 'editor' } };
    const res = mockRes();
    const next = sinon.stub();

    requireRole('admin', 'editor')(req, res, next);

    expect(next.calledOnce).to.equal(true);
  });
});
