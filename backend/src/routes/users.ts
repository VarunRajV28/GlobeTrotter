import { Router } from 'express';
import UserController from '../controllers/UserController';

const router = Router();

router.post('/', UserController.createUser);
router.get('/:id', UserController.getUserById);
router.get('/email/:email', UserController.getUserByEmail);

export default router;
