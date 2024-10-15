import { User } from '../models/user.model.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/apiError.js'
import {ApiResponse} from '../utils/apiResponse.js'
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken =  user.generateAccessToken()
    const refreshToken =  user.generateRefreshToken()
  
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
}


const registersUser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username, role } = req.body;

  console.log(fullname, email, password, username, role);
  console.log(req.body);

  // Check if any required fields are missing
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists with the same email or username
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }

  // Create new user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullname,
    role: role || "USER",
  });

  // Fetch the created user excluding sensitive fields like password
  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  // Respond with success
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginedUser = asyncHandler(async (req, res) => {
  console.log(req.body)
  // req.body => data -compleate
  // username or email -compleate
  // find the user
  //password cheack
  // accesstoken and refreshtoken

  const { email, password } = req.body
  console.log(req.body)

  if (!email) {
    throw new ApiError(400, 'email is required')
  }

 const user =  await User.findOne({
    $or:  {email}
 })
  
  if (!user) {
    throw new ApiError(401, "User does not exits")
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password)

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Inavalid user password ")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  )

  // const tokens =  generateAccessAndRefreshToken(user._id);

  // if (!tokens || !tokens.accessToken || !tokens.refreshToken) {
  //   throw new ApiError(500, 'Failed to generate tokens');
  // }

  // const { accessToken, refreshToken } = tokens;

  console.log(accessToken, refreshToken)
  const logedinUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();
  
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
  
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {user: logedinUser, accessToken, refreshToken}, "User logged In Successfull")
    )

})

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate({
    _id: req.user._id
  }, {
    $unset: {
      refreshToken: 1
    }
  }, {
    new: true
  })
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  }
  
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "user logout successfull"))

})
  
const generateNewRefreshToken = asyncHandler(async (req, res) => {
  const incommingRefeshToken =  req.cookies.refreshToken || req.body.refreshToken
  console.log(incommingRefeshToken)

  if (!incommingRefeshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incommingRefeshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
    console.log("decodedToken", decodedToken)

    const user = await User.findById(decodedToken?._id)
    
    if (!user) {
      throw new ApiError(401, "Inavlid refresh token")
    }
    
    if (incommingRefeshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used")
    }

    const options = {
      httpOnly: true,
      secure: true
      // secure: process.env.NODE_ENV === 'production', // here problem and check the error
    };

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

    user.refreshToken = newRefreshToken
    await user.save({validateBeforeSave: false})
    
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access Token Refesh"))
  }catch (error) {
    throw new ApiError(401, error?.message || "Invalid refesh token")
  }
})

const changeCurrentUser = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  console.log(req.body)
  
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400, 'old password incorrect')
  }

  user.password = newPassword
  await user.save({ validateBeforeSave: false })
  
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully"));
})

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
  .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body
  
  if (!fullname || !email) {
    throw new ApiError(400, 'All fields are required')
  }

  const updateDetails = await User.findByIdAndUpdate(
     req.user?._id,
    {
      $set: {
        fullname,
        email,
        // address: address._id
      }
    },
    {
      new: true,
      runValidators: true
    }
  )

  return res.status(200).json(new ApiResponse(200, updateDetails, 'Update Account details successfully'))
})


export {
  registersUser,
  loginedUser,
  logoutUser,
  generateNewRefreshToken,
  changeCurrentUser,
  getCurrentUser,
  updateAccountDetails
}