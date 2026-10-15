CREATE TABLE IF NOT EXISTS ratings (
 fusion TEXT NOT NULL, visitor TEXT NOT NULL, stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5), updated INTEGER NOT NULL,
 PRIMARY KEY(fusion,visitor)
);
CREATE TABLE IF NOT EXISTS submissions (
 id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('bugs','suggestions')), body TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS submissions_retention ON submissions(kind,created);
CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS limits_expiry ON limits(expires);
