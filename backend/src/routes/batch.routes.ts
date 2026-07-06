import { Router } from 'express';
import { uploadBatchImages } from '../middleware/batchUploadMiddleware';
import { batchUpload, downloadBatchZip } from '../controllers/batchController';

export const batchRouter = Router();

batchRouter.post('/upload', uploadBatchImages, batchUpload);
batchRouter.get('/download', downloadBatchZip);
