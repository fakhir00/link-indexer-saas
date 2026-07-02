import { Router } from 'express';
import { billingController } from '../controllers';

const router = Router();

router.get('/plans', billingController.getPlans);
router.get('/overview', billingController.getOverview);

export default router;
