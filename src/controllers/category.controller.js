import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

//createCategory
//getAllCategory
//getCategory
//updateCategory
//deleteCategory

const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(401, "please provide a valid name and description");
  }

  const category = await Category.create({
    name,
    description,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, category, "create category successfull "));
});

const getAllCategory = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 30,
    query,
    sortBy,
    sortType,
    categoryId,
  } = req.query;
  try {
    let filter = {};
    if (query) {
      filter.$or = [
        {
          name: { $regex: query, $options: "i" },
        },
        {
          description: { $regex: query, $options: "i" },
        },
      ];
    }

    if (categoryId === isValidObjectId(categoryId)) {
      filter.name = categoryId;
    }

    const sortOptions = {};
    if (sortBy && sortType) {
      sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
    }

    const pageNumber = Math.max(1, parseInt(page)); // Ensure page is at least 1
    const limitNumber = Math.max(1, parseInt(limit)); // Ensure limit is at least 1

    const category = await Category.find(filter)
                    .sort(sortOptions)
                   .skip((pageNumber - 1) * limitNumber)
                   .limit(limitNumber);
      
    const totalCount = await Category.countDocuments(filter);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { category, totalCount, page: pageNumber, limit: limitNumber },
          "getAll category successfully"
        )
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, error?.message || "Internal Server Error"));
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!isValidObjectId(categoryId)) {
    throw new ApiError(401, "please provide a categoryId");
  }

  const category = await Category.findById(categoryId);

  return res
    .status(200)
    .json(new ApiResponse(200, category, "get category successfull"));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  if (!isValidObjectId(categoryId)) {
    throw new ApiError(401, "please provide a categoryId");
  }

  const category = await Category.findByIdAndUpdate(
    {
      _id: categoryId,
    },
    {
      $set: {
        name,
        description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, category, "update category successfull"));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const deleteCategory = await Order.findByIdAndDelete(categoryId);
  if (!deleteCategory) {
    throw new ApiError(404, "category not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deleteCategory, "deleteOrder success"));
});

export {
  createCategory,
  getAllCategory,
  getCategory,
  updateCategory,
  deleteCategory,
};
