import { Router } from "express";
import { getuser, getAllUsers, updateProfile } from "../controller/user.js";
import rolemiddleware from "../middleware/rolemiddleware.js";

const routes = Router();

routes.get("/profile", getuser);
routes.put("/profile", updateProfile);
routes.get("/allusers", rolemiddleware, getAllUsers);

export default routes;
