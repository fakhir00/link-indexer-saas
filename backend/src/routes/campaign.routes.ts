import { Router } from 'express';
import { campaignController } from '../controllers';

const router = Router();

router.get('/', campaignController.list);
router.post('/', campaignController.create);
router.patch('/:id/status', campaignController.updateStatus);
router.delete('/:id', campaignController.delete);

export default router;
