import express from 'express';
import {
  getPosts,
  getPost,
  addPost,
  deletePost,
  updatePost,
  reportPost,
} from '../controllers/post';
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

router.get('/', verifyJWT, getPosts);
router.get('/:id', verifyJWT, getPost);
router.post('/', upload.single('img'), verifyJWT, addPost);
router.delete('/:id', verifyJWT, deletePost);
router.put('/:id', upload.single('img'), verifyJWT, updatePost);
router.post('/report', verifyJWT, reportPost);

export default router;
