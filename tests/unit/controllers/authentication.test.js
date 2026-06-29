const { expect } = require('chai');
const sinon = require('sinon');
const authController = require('../../../app_api/controllers/authentication');

function mockRes() {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
}

describe('Authentication controller (validation branches)', () => {
  afterEach(() => sinon.restore());

  it('register -> 400 when fields are missing', async () => {
    const req = { body: { email: 'a@b.com' } };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });

  it('register -> 403 when an incorrect admin code is supplied', async () => {
    const req = {
      body: {
        name: 'Wrong Key',
        email: 'wrongkey@travlr.test',
        password: 'Sand123!',
        adminKey: 'definitely-not-the-key',
      },
    };
    const res = mockRes();

    await authController.register(req, res);

    expect(res.status.calledWith(403)).to.equal(true);
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });

  it('login -> 400 when email or password is missing', () => {
    const req = { body: { email: 'a@b.com' } };
    const res = mockRes();

    authController.login(req, res);

    expect(res.status.calledWith(400)).to.equal(true);
  });
});
