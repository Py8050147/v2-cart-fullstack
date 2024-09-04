import { Router } from "express"
import { verifyJwt } from "../midlleware/auth.midlleware.js"
import { createOrder, deleteOrder, getOrders, updataOrderStatus, getOrder } from "../controllers/order.controller.js";


const router = Router();

router.use(verifyJwt)

router.route("/").get(getOrders)
    .post(createOrder)
router.route("/:orderId")
    .get(getOrder)
    .patch(updataOrderStatus)
    .delete(deleteOrder);

export default router