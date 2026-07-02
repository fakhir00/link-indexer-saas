import { Router } from 'express';
import { toolsController } from '../controllers';

const router = Router();

router.post('/google-index', toolsController.googleIndex);

export default router;
