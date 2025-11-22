import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { attachUser } from "./middleware/auth";

// Import routers
import authRouter from "./modules/auth/auth.router";
import productsRouter from "./modules/products/products.router";
import warehousesRouter from "./modules/warehouses/warehouses.router";
import locationsRouter from "./modules/locations/locations.router";
import categoriesRouter from "./modules/categories/categories.router";
import operationsRouter from "./modules/operations/operations.router";
import ledgerRouter from "./modules/ledger/ledger.router";
import dashboardRouter from "./modules/dashboard/dashboard.router";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/warehouses", warehousesRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/operations", operationsRouter);
app.use("/api/ledger", ledgerRouter);
app.use("/api/dashboard", dashboardRouter);

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err.status || 500;
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
    details: err.details || undefined,
  });
});

export default app;
