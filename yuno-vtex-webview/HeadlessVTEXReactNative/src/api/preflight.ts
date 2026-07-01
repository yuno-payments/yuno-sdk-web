/**
 * POST /session/preflight — creates the Yuno checkout session and returns the
 * session id + the affiliation's public API key. Step 1 of the flow.
 */

import {VTEX} from '../config';
import {logger, mask} from '../utils/logger';
import type {PreflightRequest, PreflightResponse} from './types';

export async function createPreflightSession(
  body: PreflightRequest,
  signal?: AbortSignal,
): Promise<PreflightResponse> {
  const url = VTEX.baseUrl + VTEX.preflightPath;
  logger.info('preflight → POST /session/preflight', {url, ...body});

  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    logger.error('preflight ← failed', {status: response.status, detail});
    throw new Error(`Preflight failed: ${response.status} ${detail}`);
  }

  const data = (await response.json()) as PreflightResponse;
  logger.info('preflight ← 200', {
    checkoutSession: data.checkoutSession,
    publicApiKey: mask(data.publicApiKey),
  });
  return data;
}
