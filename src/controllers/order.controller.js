import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Order } from "../models/order.model.js";
import { Product } from '../models/product.model.js';
import { Address } from "../models/address.model.js";
import { User } from '../models/user.model.js'; // Import User model
import mongoose from "mongoose";
import stripe from "../config/stripe.js";

// Create Order with Address and Customer Validation
const createOrder = asyncHandler(async (req, res) => {
  const { orderPrice, orderItems, address, customer, paymentMethodId } = req.body;
  console.log(req.body)
  
  // Validate required fields
  if (!orderPrice || !orderItems || !address || !customer || !paymentMethodId) {
    throw new ApiError(400, "All fields (orderPrice, orderItems, address, customer, and paymentMethodId) are required.");
  }

  // Validate if the user (customer) exists
  const userExists = await User.findById(customer);
  if (!userExists) {
    throw new ApiError(400, "Invalid customer.");
  }

  // Validate if the address exists
  const addressExists = await Address.findById(address);
  if (!addressExists) {
    throw new ApiError(400, "Invalid address.");
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
        quantity: item.quantity || 1,
      };
    })
  );

  // Process payment with Stripe
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orderPrice * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Order for user ${customer}`,
      metadata: { orderItems: JSON.stringify(orderItemsWithValidProducts) },
      return_url: 'http://localhost:5173/thank-you', // Add your return URL here
    });

    const order = await Order.create({
      orderPrice,
      orderItems: orderItemsWithValidProducts,
      customer: customer,
      address: addressExists._id,
      paymentIntentId: paymentIntent.id,
      paymentStatus: paymentIntent.status,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order created successfully"));
  } catch (error) {
    throw new ApiError(400, `Payment failed: ${error.message}`);
  }
});


// Get all orders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('customer', 'name email') // Corrected 'customer' typo
    .populate('orderItems.productId', 'name price');

  if (!orders.length) {
    throw new ApiError(404, "No orders found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get order by ID
const getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId)
    .populate('customer', 'name email')
    .populate('orderItems.productId', 'name price');

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});

// Update order status
const updataOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  // Check if the status is valid
  if (!['PENDING', 'CANCELLED', 'DELIVERED'].includes(status)) {
    throw new ApiError(400, "Invalid order status");
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: { status } },
    { new: true } // Return the updated document
  ).populate('customer', 'name email').populate('orderItems.productId', 'name price');

  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

// Delete order
const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findByIdAndDelete(orderId);
  if (!order) {
    throw new ApiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order deleted successfully"));
});

export {
  createOrder,
  getOrders,
  getOrder,
  updataOrderStatus,
  deleteOrder
};
