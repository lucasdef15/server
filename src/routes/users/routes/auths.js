"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../controllers/auth");
const verifyJWT_1 = __importDefault(require("../../../middleware/verifyJWT"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 1073741824,
        fieldSize: 1073741824,
    },
});
router.post('/signup', auth_1.signup);
router.post('/login', auth_1.login);
router.post('/logout', auth_1.logOut);
router.get('/currentUser', verifyJWT_1.default, auth_1.currentUser);
router.put('/update', upload.single('img'), verifyJWT_1.default, auth_1.updateUser);
router.post('/forgot-password', auth_1.forgotPassword);
router.post('/reset-password', auth_1.resetPassword);
exports.default = router;
