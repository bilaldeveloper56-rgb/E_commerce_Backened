import { Router } from "express";

import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import { authmiddleware } from "../middleware/authmiddleware.js";
import rolemiddleware from "../middleware/rolemiddleware.js";
import errorHandler from "../middleware/errormiddlwware.js";
import productRoutes from "./product.js";
import orderRoutes from "./order.js";
const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/user", authmiddleware, userRoutes);
routes.use("/product", productRoutes);
routes.use("/order", orderRoutes);

export default routes;
