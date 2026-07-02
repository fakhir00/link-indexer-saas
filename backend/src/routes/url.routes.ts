import { Router } from 'express';
import { urlController } from '../controllers';

const router = Router();

router.get('/', urlController.list);
router.post('/:id/retry', urlController.retry);
router.post('/retry-failed', urlController.retryAllFailed);

export default router;
