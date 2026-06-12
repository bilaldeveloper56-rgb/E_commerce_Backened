import { Product } from "../models/Product.js";
import { uploadCloudinary } from "../utils/uploadcloudinary.js";

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category } = req.body;
    const image = req.file;

    const result = await uploadCloudinary(req.file.buffer);

    const imageUrl = result.secure_url;

    const newProduct = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      imageUrl,
    });
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      product: newProduct,
    });
  } catch (error) {
    // throw new Error(error);
    // console.log(error);
    res.status(500).json({
      message: "Failed to create product",
      success: false,
      error: error.message,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const { search, category, limit = 10, skip, sort } = req.query;
    const matchStage = { stock: { $gt: 0 } };
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      matchStage.category = category;
    }

    const allproducts = await Product.find(matchStage)
      .sort({ price: sort === "asc" ? 1 : -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      allproducts,
      numberOfProducts: allproducts.length,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const getsingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    res.status(200).json({
      message: "Product retrieved successfully",
      success: true,
      product,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllProductsForAdmin = async (req, res) => {
  try {
    const { search, category, limit = 10, skip, sort } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      filter.category = category;
    }

    const allproducts = await Product.find(filter)
      .sort({ price: sort === "asc" ? 1 : -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    res.status(200).json({
      message: "Products retrieved successfully",
      success: true,
      allproducts,
      numberOfProducts: allproducts.length,
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, category } = req.body;
    const updatedData = {};

    if (title) updatedData.title = title;
    if (description) updatedData.description = description;
    if (price) updatedData.price = price;
    if (stock !== undefined) updatedData.stock = stock;
    if (category) updatedData.category = category;

    if (req.file) {
      const result = await uploadCloudinary(req.file.buffer);
      updatedData.imageUrl = result.secure_url;
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    res.status(200).json({
      message: "Product updated successfully",
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update product",
      success: false,
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }
    res.status(200).json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete product",
      success: false,
      error: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.status(200).json({
      message: "Categories retrieved successfully",
      success: true,
      categories: categories.filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve categories",
      success: false,
      error: error.message,
    });
  }
};
