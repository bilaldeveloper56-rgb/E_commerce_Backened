import { Router } from "express";
import { getme, login, signup, forgotPassword, resetPassword } from "../controller/auth.js";
import { authmiddleware } from "../middleware/authmiddleware.js";

const routes = Router();

routes.post("/signup", signup);
routes.post("/login", login);
routes.get("/me", authmiddleware, getme);
routes.post("/forgot-password", forgotPassword);
routes.post("/reset-password/:token", resetPassword);

export default routes;
