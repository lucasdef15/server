import { Request, Response } from 'express';
import { prisma } from '../../../lib/db';

export const getCats = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany();

    const hierarchicalData = buildHierarchicalMenu(categories);

    return res.json(hierarchicalData);
  } catch (error) {
    console.error('Error getting categories:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to get categories.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const addCat = async (req: Request, res: Response) => {
  try {
    const { name, parent_id } = req.body;

    await prisma.category.create({
      data: {
        category: name,
        parentId: parent_id,
      },
    });

    const categories = await prisma.category.findMany();

    const hierarchicalData = buildHierarchicalMenu(categories);

    return res.json(hierarchicalData);
  } catch (error) {
    console.error('Error adding category:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to add category.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
export const deleteCat = async (req: Request, res: Response) => {
  try {
    const catId = req.params.id;

    await prisma.category.delete({
      where: {
        id: catId,
      },
    });

    return res.json('Category has been deleted.');
  } catch (error) {
    console.error('Error trying to delete category:', error);
    return res.status(500).json({
      errors: [{ msg: 'Failed to delete category.' }],
      data: null,
    });
  } finally {
    await prisma.$disconnect();
  }
};
function buildHierarchicalMenu(data: any[]) {
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
function populateChildren(parent: any, items: any[]) {
  parent.children = items.filter((item) => item.parentId === parent.id);
  parent.children.forEach((child: any) => {
    populateChildren(child, items);
  });
}
