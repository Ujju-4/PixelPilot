import { Router } from 'express';
import { uploadSingleImage } from '../middleware/uploadMiddleware';
import { getImageFile, uploadImage } from '../controllers/imagesController';
import {
  compress,
  compressPreview,
  convert,
  enhance,
  listResizePresets,
  magicExpandHandler,
  metadataHandler,
  ocrHandler,
  removeBackgroundHandler,
  removeObjectHandler,
  resize,
  upscale,
} from '../controllers/editsController';

export const imagesRouter = Router();

imagesRouter.post('/upload', uploadSingleImage, uploadImage);
imagesRouter.get('/resize-presets', listResizePresets);
imagesRouter.get('/:id/file', getImageFile);
imagesRouter.get('/:id/metadata', metadataHandler);
imagesRouter.post('/:id/resize', resize);
imagesRouter.post('/:id/compress', compress);
imagesRouter.post('/:id/compress/preview', compressPreview);
imagesRouter.post('/:id/convert', convert);
imagesRouter.post('/:id/upscale', upscale);
imagesRouter.post('/:id/enhance', enhance);
imagesRouter.post('/:id/remove-background', removeBackgroundHandler);
imagesRouter.post('/:id/remove-object', removeObjectHandler);
imagesRouter.post('/:id/expand', magicExpandHandler);
imagesRouter.post('/:id/ocr', ocrHandler);
