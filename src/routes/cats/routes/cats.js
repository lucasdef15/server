"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyJWT_1 = __importDefault(require("../../../middleware/verifyJWT"));
const cat_1 = require("../controllers/cat");
const router = express_1.default.Router();
// add the admin routes later
router.get('/', verifyJWT_1.default, cat_1.getCats);
router.post('/', verifyJWT_1.default, cat_1.addCat);
router.delete('/:id', verifyJWT_1.default, cat_1.deleteCat);
exports.default = router;
