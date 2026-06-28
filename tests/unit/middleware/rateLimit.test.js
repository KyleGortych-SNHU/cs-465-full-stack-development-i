/* Test for rate limiter
 *
 * Reference: Nawaz Dhandala
 * date: 03/31/2026
 * url: https://oneuptime.com/blog/post/2026-03-31-mongodb-rate-limiting/view
 */
const { expect } = require('chai');
const sinon = require('sinon');
const RateLimit = require('../../../app_api/models/rateLimit');
const { createRateLimiter } = require('../../../app_api/middleware/rateLimit');

describe('rateLimit middleware', () => {
  afterEach(() => sinon.restore());

  const mockRes = () => ({
    statusCode: null, headers: {}, body: null,
    set(h) { Object.assign(this.headers, h); return this; },
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  });
  const req = { ip: '1.2.3.4', baseUrl: '/api', path: '/login' };

  it('calls next and sets headers when under the limit', async () => {
    sinon.stub(RateLimit, 'findOneAndUpdate').resolves({ count: 1 });
    const res = mockRes();
    const next = sinon.spy();

    await createRateLimiter(10, 60000)(req, res, next);

    expect(next.calledOnce).to.equal(true);
    expect(res.statusCode).to.equal(null);
    expect(res.headers['X-RateLimit-Remaining']).to.equal(9);
  });

  it('returns 429 and skips next when over the limit', async () => {
    sinon.stub(RateLimit, 'findOneAndUpdate').resolves({ count: 11 });
    const res = mockRes();
    const next = sinon.spy();

    await createRateLimiter(10, 60000)(req, res, next);

    expect(res.statusCode).to.equal(429);
    expect(res.body.message).to.match(/too many/i);
    expect(next.called).to.equal(false);
  });
});
