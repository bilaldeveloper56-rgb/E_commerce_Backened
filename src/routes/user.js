import { Router } from "express";
import { getuser, getAllUsers, updateProfile } from "../controller/user.js";
import { authmiddleware } from "../middleware/authmiddleware.js";
import rolemiddleware from "../middleware/rolemiddleware.js";

const routes = Router();

routes.get("/profile", authmiddleware, getuser);
routes.put("/profile", authmiddleware, updateProfile);
routes.get("/allusers", authmiddleware, rolemiddleware, getAllUsers);

export default routes;
