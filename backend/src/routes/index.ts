import { Router } from 'express';
import { healthRouter } from './health.routes';
import { imagesRouter } from './images.routes';
import { batchRouter } from './batch.routes';
import { historyRouter } from './history.routes';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/images', imagesRouter);
apiRouter.use('/batch', batchRouter);
apiRouter.use('/history', historyRouter);
