// Loaded by .mocharc.json before any test runs
process.env.NODE_ENV  = process.env.NODE_ENV  || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-not-for-production';
process.env.MONGO_URI  = process.env.MONGO_URI  || 'mongodb://127.0.0.1:27017/travlr_test';
