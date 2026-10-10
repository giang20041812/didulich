import type { Express } from 'express';
import { authRouter } from './auth.js';
import { exploreRouter } from './explore.js';
import { healthRouter } from './health.js';
import { publicCatalogRouter } from './publicCatalog.js';
import { bookingRouter, stayRouter } from './publicBooking.js';
import { sepayRouter } from './sepayWebhook.js';

/** Gắn mọi router của API. Mỗi router gắn kèm "phong cách" lỗi của nhóm route (xem lib/errorHandler.ts). */
export function mountRoutes(app: Express): void {
  app.use(healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use(publicCatalogRouter);
  app.use(bookingRouter);
  app.use(exploreRouter);
  app.use(stayRouter);
  app.use(sepayRouter);
}
