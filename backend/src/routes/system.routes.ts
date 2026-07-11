import { Router } from 'express';
import { systemController } from '../controllers';

const router = Router();

router.get('/health', systemController.getDetails);
router.get('/details', systemController.getDetails);
router.get('/enqueue-old', systemController.enqueueOld);

export default router;
