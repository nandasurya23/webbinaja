import { S3Client } from '@aws-sdk/client-s3';
import { loadR2Credentials } from './config';

/**
 * Cloudflare R2 exposes an S3-compatible API, so the standard S3 SDK works
 * unmodified against `https://{accountId}.r2.cloudflarestorage.com`.
 * Credentials are only ever read here, in the CLI process — never shipped
 * to the browser.
 */
export function createR2Client(): S3Client {
  const { accountId, accessKeyId, secretAccessKey } = loadR2Credentials();

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}
