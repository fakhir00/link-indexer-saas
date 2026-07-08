import { Router } from 'express';
import { toolsController } from '../controllers';

const router = Router();

router.post('/google-index', toolsController.googleIndex);
router.post('/verify-index', toolsController.verifyIndex);

export default router;
