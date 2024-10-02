import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Address } from "../models/address.model.js";

// createAddress
const createAddress = asyncHandler(async (req, res) => {
  const { street, city, state, postalCode, phone, user } = req.body;
  console.log(req.body)
  if (
    [street, city, state, postalCode, phone].some(
      field => !field || (typeof field === 'string' && field.trim() === "")
    )
  ) {
    throw new ApiError(401, "All fields are required");
  }

  const address = await Address.create({
    street,
    city,
    state,
    postalCode,
    phone,
    user: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});
// getAddress
const getAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) {
    throw new ApiError(401, "Address Id not found");
  }

  const address = await Address.findById(addressId).lean();

  return res
    .status(200)
    .json(new ApiResponse(200, address, "Address Successfully Fetched"));
});

// updateAddress
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  if (!addressId) {
    throw new ApiError(401, "Address Id not found");
  }

  const updatedAddress = await Address.findByIdAndUpdate(
    {
          _id: addressId,
          user: req.user?._id
    },
      {
      $set: {
        street,
        city,
        state,
        postalCode,
        phone,
      },
      },
      {
        new: true
    }
    );
    return res.status(200).json(new ApiResponse(200, updatedAddress, 'Address updated successfully'))
});
// deleteAddress

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    const deletedAddress = await Address.findByIdAndDelete({ _id: addressId, user: req.user._id });

    if (!deletedAddress) {
        throw new ApiError(404, 'Address not found');
      }
    
      return res.status(200).json(new ApiResponse(200, {}, 'Address deleted successfully'));
 
})

export {
    createAddress,
    getAddress,
    updateAddress,
    deleteAddress
}