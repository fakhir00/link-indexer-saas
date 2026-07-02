import { Router } from 'express';
import { apiKeyController } from '../controllers';

const router = Router();

router.get('/', apiKeyController.list);
router.post('/', apiKeyController.create);
router.delete('/:id', apiKeyController.revoke);

export default router;
