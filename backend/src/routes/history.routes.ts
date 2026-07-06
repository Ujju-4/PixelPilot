import { Router } from 'express';
import {
  deleteHistoryEntry,
  getHistoryEntry,
  listHistory,
  renameHistoryEntry,
} from '../controllers/historyController';

export const historyRouter = Router();

historyRouter.get('/', listHistory);
historyRouter.get('/:id', getHistoryEntry);
historyRouter.patch('/:id', renameHistoryEntry);
historyRouter.delete('/:id', deleteHistoryEntry);
