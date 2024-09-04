import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";
// import { isValidObjectId } from "mongoose";
import { Product } from '../models/product.model.js'
// import { User } from '../models/user.model'

// createOrder
// getOrders
// getOrder
// updataOrder
// deleteOrder

const createOrder = asyncHandler(async (req, res) => {
    const { orderPrice, customer, orderItems, address } = req.body

    if (!orderPrice || !customer || !orderItems || !address) {
         throw new ApiError (400, 'All fields are required.' );
      }
  

    const orderItemsWithValidProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findById(item.productId);
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }
          return item;
        })
      );
    
    const order = await Order.create({
        orderPrice,
        orderItems: orderItemsWithValidProducts,
        customer,
        address
    })

    return res.status(200).json(new ApiResponse(201, order, 'order create successfull'))
})

const getOrders = asyncHandler(async (req, res) => {
    // const {orderId} = req.params
    const orders = await Order.find().populate('couster', 'name email').populate('orderItems.productId', 'name price')
    if (!orders) {
        throw new ApiError(404,"orders not found");
    }

    return res.status(200).json(new ApiResponse(201, orders, 'orders get successfull'))
})

const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(404,"order not found");
    }

    return res.status(200).json(new ApiResponse(201, order, 'order get by id successfull'))
})

const updataOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body
    
    if (!['PENDING', 'CANCELLED', 'DELIVERED'].includes(status)) {
        throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set:{status} },
        { new: true }
    );
    
    return res.status(200).json(new ApiResponse(200, order, 'updataOrderStatus successfull'))

})

const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const deleteOrder = await Order.findByIdAndDelete(orderId)
    if (!deleteOrder) {
        throw new ApiError(404, "order not found");
    }
    return res.status(200).json(new ApiResponse(200, deleteOrder, 'deleteOrder success'))
})

export {
    createOrder,
    getOrders,
    getOrder,
    updataOrderStatus,
    deleteOrder
}