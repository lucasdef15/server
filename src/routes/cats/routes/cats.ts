import express from 'express';
import verifyJWT from '../../../middleware/verifyJWT';
import { getCats, addCat, deleteCat } from '../controllers/cat';

const router = express.Router();

// add the admin routes later

router.get('/', verifyJWT, getCats);
router.post('/', verifyJWT, addCat);
router.delete('/:id', verifyJWT, deleteCat);

export default router;
