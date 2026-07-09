import { Router } from 'express';
import { urlController } from '../controllers';

const router = Router();

router.get('/', urlController.list);
router.get('/:id', urlController.getDetails);
router.post('/:id/retry', urlController.retry);
router.post('/retry-failed', urlController.retryAllFailed);
router.post('/retry-stuck', urlController.retryAllStuck);

export default router;
