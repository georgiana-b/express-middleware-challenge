import { Router } from 'express';
import Order from '../models/Order';
import { fetchOrders } from '../services/ordersService';

const router = Router();

router.get('/download', async (req, res) => {
    try {
      // Fetch orders from Service A
      const orders = await fetchOrders();
  
      res.status(200).json({ message: 'Orders fetched and saved', orders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching orders' });
    }
});

// Route to view saved orders
router.get('/retrieve', async (req, res) => {
  try {
    const orders = await Order.findAll(); // Find all orders in the database
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching orders from the database' });
  }
});

export { router };
