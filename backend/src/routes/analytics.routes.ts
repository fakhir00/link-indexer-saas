import { Router } from 'express';
import { analyticsController } from '../controllers';

const router = Router();

router.get('/', analyticsController.getDashboard);

export default router;
