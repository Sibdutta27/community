# CommunityBackend -- Community

## Render Deployment Notes

Use these commands in Render Web Service settings:

- Build Command: `npm install && npm run build`
- Start Command: `npm run start:render`

`start:render` runs Prisma migrations (`prisma migrate deploy`) before starting the app.

Required environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `S3_REGION`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET`
- `S3_PROVIDER`

Health check:

- Path: `/health`
