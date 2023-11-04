import express from 'express';
import {
  signup,
  login,
  logOut,
  currentUser,
  updateUser,
  forgotPassword,
  resetPassword,
} from '../controllers/auth';
import verifyJWT from '../../../middleware/verifyJWT';
import multer from 'multer';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1073741824,
    fieldSize: 1073741824,
  },
});

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logOut);
router.get('/currentUser', verifyJWT, currentUser);
router.put('/update', upload.single('img'), verifyJWT, updateUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
