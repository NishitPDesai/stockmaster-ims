import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { ProductCategory } from "@prisma/client";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  // Return all enum values as category options
  const categoryList = Object.values(ProductCategory).map((name, index) => ({
    id: `cat-${index + 1}`,
    name,
  }));

  res.json(categoryList);
});

export default router;
