"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const post_1 = require("../controllers/post");
const verifyJWT_1 = __importDefault(require("../../../middleware/verifyJWT"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.get('/', verifyJWT_1.default, post_1.getPosts);
router.get('/:id', verifyJWT_1.default, post_1.getPost);
router.post('/', upload.single('img'), verifyJWT_1.default, post_1.addPost);
router.delete('/:id', verifyJWT_1.default, post_1.deletePost);
router.put('/:id', upload.single('img'), verifyJWT_1.default, post_1.updatePost);
router.post('/report', verifyJWT_1.default, post_1.reportPost);
exports.default = router;
