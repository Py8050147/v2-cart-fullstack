import { Router } from "express"
import { verifyJwt } from "../midlleware/auth.midlleware.js"
import { createAddress, deleteAddress, getAddress, getAddressId, updateAddress } from "../controllers/address.controller.js"

const router = Router()

router.use(verifyJwt)

router.route('/').get(getAddress)
.post(createAddress)
router.route("/:addressId")
    .get(getAddressId)
    .patch(updateAddress)
    .delete(deleteAddress)

export default router