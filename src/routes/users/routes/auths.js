"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const loginLimiter_1 = __importDefault(require("../../../middleware/loginLimiter"));
const verifyJWT_1 = __importDefault(require("../../../middleware/verifyJWT"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/signup', auth_1.signup);
router.post('/login', loginLimiter_1.default, auth_1.login);
router.post('/logout', auth_1.logOut);
router.get('/currentUser', verifyJWT_1.default, auth_1.currentUser);
router.put('/update', upload.single('img'), verifyJWT_1.default, auth_1.updateUser);
exports.default = router;