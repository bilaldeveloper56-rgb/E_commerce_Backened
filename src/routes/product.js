import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllProductsForAdmin,
  getsingleProduct,
  updateProduct,
  getCategories,
} from "../controller/product.js";
import { authmiddleware } from "../middleware/authmiddleware.js";
import rolemiddleware from "../middleware/rolemiddleware.js";
import uploadMulter from "../config/multer.js";

const router = Router();

router.post(
  "/addproduct",
  authmiddleware,
  rolemiddleware,
  uploadMulter,
  createProduct,
);
router.get("/getproducts", authmiddleware, getAllProducts);
router.get(
  "/getproductsforadmin",
  authmiddleware,
  rolemiddleware,
  getAllProductsForAdmin,
);
router.get("/categories", authmiddleware, getCategories);
router.get("/getsingleproduct/:id", authmiddleware, getsingleProduct);
router.put(
  "/updateproduct/:id",
  authmiddleware,
  rolemiddleware,
  uploadMulter,
  updateProduct,
);

router.delete(
  "/deleteproduct/:id",
  authmiddleware,
  rolemiddleware,
  deleteProduct,
);
export default router;
