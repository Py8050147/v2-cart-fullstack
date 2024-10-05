import { Router } from "express"
import {verifyJwt} from "../midlleware/auth.midlleware.js"
import { changeCurrentUser, generateNewRefreshToken, getCurrentUser, loginedUser, logoutUser, registersUser, updateAccountDetails } from "../controllers/user.controller.js";


const router = Router();

router.route("/register").post(registersUser)
router.route("/login").post(loginedUser)
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(generateNewRefreshToken)
router.route("/getCurrentUser").get(verifyJwt, getCurrentUser)
router.route("/change-password").post(verifyJwt, changeCurrentUser)
router.route("/updateAccount").patch(verifyJwt, updateAccountDetails)

export default router