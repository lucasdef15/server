"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCat = exports.addCat = exports.getCats = void 0;
const db_1 = require("../../../lib/db");
const getCats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield db_1.prisma.category.findMany();
        const hierarchicalData = buildHierarchicalMenu(categories);
        return res.json(hierarchicalData);
    }
    catch (error) {
        console.error('Error getting categories:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to get categories.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.getCats = getCats;
const addCat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, parent_id } = req.body;
        yield db_1.prisma.category.create({
            data: {
                category: name,
                parentId: parent_id,
            },
        });
        const categories = yield db_1.prisma.category.findMany();
        const hierarchicalData = buildHierarchicalMenu(categories);
        return res.json(hierarchicalData);
    }
    catch (error) {
        console.error('Error adding category:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to add category.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.addCat = addCat;
const deleteCat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const catId = req.params.id;
        yield db_1.prisma.category.delete({
            where: {
                id: catId,
            },
        });
        return res.json('Category has been deleted.');
    }
    catch (error) {
        console.error('Error trying to delete category:', error);
        return res.status(500).json({
            errors: [{ msg: 'Failed to delete category.' }],
            data: null,
        });
    }
    finally {
        yield db_1.prisma.$disconnect();
    }
});
exports.deleteCat = deleteCat;
function buildHierarchicalMenu(data) {
    const menuItems = data.map((row) => ({
        id: row.id,
        name: row.category,
        parentId: row.parentId,
        children: [],
    }));
    const rootItems = menuItems.filter((item) => item.parentId === '0');
    rootItems.forEach((rootItem) => {
        populateChildren(rootItem, menuItems);
    });
    return rootItems;
}
function populateChildren(parent, items) {
    parent.children = items.filter((item) => item.parentId === parent.id);
    parent.children.forEach((child) => {
        populateChildren(child, items);
    });
}
