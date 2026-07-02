import { Router } from 'express';
import { systemController } from '../controllers';

const router = Router();

router.get('/', systemController.getDetails);

export default router;
