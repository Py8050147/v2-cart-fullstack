import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import {Category} from '../models/category.model.js'

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;
  
  console.log(req.body);
  console.log(req.files); 

  const categoryDocument = await Category.findOne({ name: category });
  if (!categoryDocument) {
    throw new ApiError(400, "Category not found");
  }


  if (!name || !description || !price) {
    throw new ApiError(
      400,
      "Name, description, productImg, price and category are required"
    );
  }

  // const avatarLocalPath = req.files?.avatar[0]?.path;

  let productImgLocalFilePath = req.files?.productImg[0]?.path;
  
  console.log(productImgLocalFilePath)

  // Check if the file is uploaded and extract the path
  // if (req.files && Array.isArray(req.files.productImg) && req.files.productImg.length > 0) {
  //   productImgLocalFilePath = req.files.productImg[0].path;
  //   console.log(productImgLocalFilePath)
  // } else {
  //   throw new ApiError(400, "Product image is required");
  // }

  // Upload image to Cloudinary
  let productImgPath = null;
  try {
    productImgPath = await uploadOnCloudinary(productImgLocalFilePath);
    console.log(productImgPath);
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new ApiError(500, "Image upload failed. Please try again.");
  }

  // Ensure the image upload returned a secure URL
  if (!productImgPath || !productImgPath.secure_url) {
    throw new ApiError(500, "Image upload failed. Please try again.");
  }

  // Create a new product
  const newProduct = await Product.create({
    name,
    description,
    productImg: productImgPath.secure_url, // Ensure this is valid
    price,
    category: categoryDocument._id,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newProduct, "Product created successfully"));
});

const getAllProduct = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, query, sortBy, sortType, userId } = req.query;

  try {
    let filter = {};
    if (query) {
      filter.$or = [
        {
          name: { $regex: query, $options: "i" },
        },
        {
          category: { $regex: query, $options: "i" },
        },
      ];
    }

    if (userId === isValidObjectId(userId)) {
      filter.owner = userId;
    }

    const sortOptions = {};
    if (sortBy && sortType) {
      sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
      }
      
      const product = await Product.find(filter).sort(sortOptions).skip((page - 1) * limit).limit(parseInt(limit))
      
      const totalProduct = await Product.countDocuments(product)

      return res
          .status(200)
          .json(new ApiResponse(200, {product, totalProduct, page, limit}, 'getAll product successfully'))
  } catch (error) {
    return res
    .status(500)
    .json(new ApiResponse(500, error?.message || "Internal Server Error"));
  }
});

const getProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!isValidObjectId(productId)) {
        throw new ApiError("Please Provide a Valid Product Id");
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError("Product is not found");
    }

    return res.status(200).json(new ApiResponse(200, product, 'product fetched successfully'))
})

const upadateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    const { name, description, price, stock } = req.body
  const {productImg} = req.file?.path
    if (!isValidObjectId(productId)) {
        throw new ApiError(400, 'please provide a valid product id')
    }

    const product = await Product.findByIdAndUpdate(
        {
        _id: productId
        },
        {
            $set: {
                name,
                description,
                price,
                stock,
                productImg: productImg.url
            }
        },
        {
            new: true,
          }
    )

    return res.status(200).json(new ApiResponse(200, product, 'product update successfully'))

})  

const deleteProduct = asyncHandler(async(req, res) => {
  const { productId } = req.params

  const product = await Product.findByIdAndDelete(productId)

     return res.status(200).json(new ApiResponse(200, product, 'product delete successfully'))
})
export {
    createProduct,
    getAllProduct,
    getProduct,
   upadateProduct,
    deleteProduct
};
    
// const products = await Product.find()
// .populate("owner", "name")
// .populate("category", "fullname");
// if (!products) {
// throw new ApiError(401, "products not found");
// }
