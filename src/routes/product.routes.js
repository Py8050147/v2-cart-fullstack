import { Router } from "express"
import { verifyJwt } from "../midlleware/auth.midlleware.js"
import { upload } from "../midlleware/multer.midlleare.js";
import { createProduct, getAllProduct, getProduct, deleteProduct, upadateProduct } from "../controllers/product.controller.js";

const router = Router();

router.use(verifyJwt)

router.route('/').get(getAllProduct)
    .post(
    upload.fields([{name: "productImg", maxCount: 1}]),
        // upload.single("productImg"),
        createProduct
)
    
router.route('/:productId')
    .get(getProduct)
   .delete(deleteProduct)
   .patch(upload.single("productImg"), upadateProduct);
 



export default router