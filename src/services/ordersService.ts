import axios from 'axios';
import Order from '../models/Order'; // Import the Sequelize Order model

const SERVICE_A_URL = 'https://ie24.challenge.dev.kanpla.io/api/service-a';

// Fetch and save orders, iterating through all pages
export const fetchOrders = async () => {
  try {
    let page = 1;
    const limit = 10;
    let hasMoreOrders = true;
    const allOrders: any[] = [];

    while (hasMoreOrders) {
      const response = await axios.get(SERVICE_A_URL, { params: { page, limit } });
      const { orders } = response.data;

      if (Array.isArray(orders) && orders.length > 0) {
        allOrders.push(...orders);
        await saveOrdersToDatabase(orders); // Save current page's orders to the database
        page += 1;
      } else {
        hasMoreOrders = false; // Stop fetching if no orders are returned
      }
    }

    return allOrders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
};

const saveOrdersToDatabase = async (orders: any[]) => {
    for (const order of orders) {
      await Order.upsert({
        id: order.id,
        item: order.item,
        customer: order.customer,
        billingFrequency: order.billingFrequency,
      });
    }
  };

export const getOrdersFromDatabase = async () => {
  try {
    const orders = await Order.findAll(); // Sequelize method to fetch all orders
    return orders;
  } catch (error) {
    console.error('Error fetching orders from the database:', error);
    throw new Error('Failed to fetch orders from database');
  }
};
