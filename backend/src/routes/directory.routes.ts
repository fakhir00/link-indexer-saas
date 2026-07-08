import { Router } from 'express';
import { directoryController } from '../controllers/directory.controller';

const router = Router();

router.get('/', directoryController.getPaginated);
router.get('/recent', directoryController.getRecent);
router.get('/popular', directoryController.getPopular);
router.get('/daily/:date', directoryController.getDaily);
router.get('/weekly/:week', directoryController.getWeekly);
router.get('/monthly/:month', directoryController.getMonthly);
router.get('/category/:slug', directoryController.getByCategory);

export default router;
