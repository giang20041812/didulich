import type { Express } from 'express';
import { healthRouter } from './health.js';

/** Gắn mọi router của API. Mỗi router gắn kèm "phong cách" lỗi của nhóm route (xem lib/errorHandler.ts). */
export function mountRoutes(app: Express): void {
  app.use(healthRouter);
}
