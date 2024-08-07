import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken"
import {asyncHandler} from "../utils/asyncHandler.js"

export const verifyJwt = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    console.log(token)
    if (!token) {
        return next(new ApiError(401, 'Unauthorized'))
    }
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        return next(new ApiError(401, 'Unauthorized'))
    }
})