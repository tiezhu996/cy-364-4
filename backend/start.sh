#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
node wait-for-db.js

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push

echo "Seeding database..."
npx prisma db seed

echo "Starting application..."
node dist/main.js
