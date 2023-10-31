import express from 'express';
import {
  signup,
  login,
  logOut,
  currentUser,
  updateUser,
} from '../controllers/auth';
import loginLimiter from '../../../middleware/loginLimiter';
import verifyJWT from '../../../middleware/verifyJWT';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/signup', signup);
router.post('/login', loginLimiter, login);
router.post('/logout', logOut);
router.get('/currentUser', verifyJWT, currentUser);
router.put('/update', upload.single('img'), verifyJWT, updateUser);

export default router;
