import { Router } from "express"
import {verifyJwt} from "../midlleware/auth.midlleware.js"
import { generateNewRefreshToken, loginedUser, logoutUser, registersUser } from "../controllers/user.controller.js";


const router = Router();

router.route("/register").post(registersUser)
router.route("/login").post(loginedUser)
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").post(generateNewRefreshToken)

export default router