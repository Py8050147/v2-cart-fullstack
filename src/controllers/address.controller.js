import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Address } from "../models/address.model.js";

// createAddress
const createAddress = asyncHandler(async (req, res) => {
  const { street, city, state, postalCode, phone } = req.body;
  console.log(req.body)

  // Ensure all fields are provided and not empty
  if (
    [street, city, state, postalCode, phone].some(
      field => !field || (typeof field === 'string' && field.trim() === "")
    )
  ) {
    throw new ApiError(400, "All fields are required");  // Use 400 for bad request
  }

  // Create the address
  const address = await Address.create({
    street,
    city,
    state,
    postalCode,
    phone,
    user: req.user._id,  // Attach the logged-in user's ID
  });

  // Respond with the created address
  return res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

const getAddress = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).lean();

  if (addresses.length === 0) {
    throw new ApiError(404, "No addresses found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses successfully fetched"));
});

// getAddress
const getAddressId = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  console.log(req.params)

  // Ensure address ID is provided
  if (!addressId) {
    throw new ApiError(400, "Address ID is required");  // 400 for missing data
  }

  // Fetch the address by ID
  const address = await Address.findById(addressId).lean();

  // If no address found, throw an error
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Respond with the fetched address
  return res
    .status(200)
    .json(new ApiResponse(200, address, "Address successfully fetched"));
});

// updateAddress
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { street, city, state, postalCode, phone } = req.body;

  // Ensure address ID is provided
  if (!addressId) {
    throw new ApiError(400, "Address ID is required");
  }

  // Find the address by ID and user and update it
  const updatedAddress = await Address.findOneAndUpdate(
    { _id: addressId, user: req.user._id },  // Ensure user owns the address
    {
      $set: {
        street,
        city,
        state,
        postalCode,
        phone,
      },
    },
    { new: true }  // Return the updated document
  );

  // If no address found, throw an error
  if (!updatedAddress) {
    throw new ApiError(404, "Address not found or not authorized");
  }

  // Respond with the updated address
  return res
    .status(200)
    .json(new ApiResponse(200, updatedAddress, "Address updated successfully"));
});

// deleteAddress
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Ensure address ID is provided
  if (!addressId) {
    throw new ApiError(400, "Address ID is required");
  }

  // Find the address by ID and user and delete it
  const deletedAddress = await Address.findOneAndDelete({
    _id: addressId,
    user: req.user._id,  // Ensure user owns the address
  });

  // If no address found, throw an error
  if (!deletedAddress) {
    throw new ApiError(404, "Address not found or not authorized");
  }

  // Respond with success message
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Address deleted successfully"));
});

export {
  createAddress,
  getAddress,
  getAddressId,
  updateAddress,
  deleteAddress
};
