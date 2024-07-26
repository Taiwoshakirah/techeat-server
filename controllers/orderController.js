
const Order = require('../models/order');
const User = require('../models/user');
const Products = require('../models/product')

const createOrder = async (req, res) => {
  try {
    const { userId, items, total } = req.body;
    const newOrder = new Order({ userId, items, total });
    const order = await newOrder.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const orders = await Order.find({ userId })
      .populate({
        path: 'items.productId',
        model: 'Products', 
        select: 'name price' 
      });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'No orders found for this user' });
    }
    const response = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      orders: orders.map(order => ({
        id: order._id,
        orderDate: order.createdAt,
        status: order.status,
        products: order.items.map(item => ({
          id: item.productId._id,
          name: item.productId.name,
          price: item.productId.price,
          quantity: item.quantity,
          status: item.status
        })),
        
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.orderId, req.body, {
      new: true,
    });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrder, getUserOrders, updateOrder };
