import { Router } from "express";
import { getme, login, signup } from "../controller/auth.js";
import { authmiddleware } from "../middleware/authmiddleware.js";

const routes = Router();

routes.post("/signup", signup);
routes.post("/login", login);
routes.get("/me", authmiddleware, getme);

export default routes;
