import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import prisma from "../../lib/prisma";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const categories = await prisma.product.findMany({
    where: { category: { not: null } },
    distinct: ["category"],
    select: { category: true },
  });

  const categoryList = categories
    .map((p) => p.category)
    .filter((c): c is string => c !== null)
    .sort();

  res.json(categoryList);
});

export default router;
