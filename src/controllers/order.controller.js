import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";
// import { isValidObjectId } from "mongoose";
import { Product } from '../models/product.model.js'
import { Address } from "../models/address.model.js";
import mongoose from "mongoose";
// import { User } from '../models/user.model'

// createOrder
// getOrders
// getOrder
// updataOrder
// deleteOrder


// Create Order with Address Handling
const createOrder = asyncHandler(async (req, res) => {
    const { orderPrice, orderItems, address, status } = req.body;
    
    // Validate required fields
    if (!orderPrice || !orderItems || !address) {
      throw new ApiError(400, 'All fields are required.');
    }
  
    // Validate orderItems: Ensure each item has a valid productId and quantity
    const orderItemsWithValidProducts = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new ApiError(404, `Product with ID ${item.productId} not found`);
        }
        return {
          productId: product._id,
          quantity: item.quantity || 1, // Default to quantity of 1 if not provided
        };
      })
    );
  
    // Check if address already exists for the user
    let orderAddress;
    if (mongoose.isValidObjectId(address)) {
      // If address is a valid ObjectId, check if it exists
      orderAddress = await Address.findOne({ _id: address, user: req.user._id });
      if (!orderAddress) {
        throw new ApiError(404, 'Address not found for the user');
      }
    } else {
      // If address is an object, create a new address
      const { street, city, state, postalCode, phone } = address;
      if (!street || !city || !state || !postalCode || !phone) {
        throw new ApiError(400, 'All address fields are required');
      }
  
      // Create a new address
      orderAddress = await Address.create({
        street,
        city,
        state,
        postalCode,
        phone,
        user: req.user._id, // Ensure the address is linked to the user
      });
    }
  
    // Create the order with the validated order items and address
    const order = await Order.create({
      orderPrice,
      orderItems: orderItemsWithValidProducts,
      customer: req.user._id,
      address: orderAddress._id, // Store the address ID in the order
      status
    });
  
    return res.status(201).json(new ApiResponse(201, order, 'Order created successfully'));
  });
  

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