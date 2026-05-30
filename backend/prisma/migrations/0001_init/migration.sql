CREATE TABLE "users" (
    "id"        SERIAL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL UNIQUE,
    "password"  TEXT NOT NULL,
    "role"      TEXT NOT NULL DEFAULT 'customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
