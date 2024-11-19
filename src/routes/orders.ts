import { Router } from 'express';
import Order from '../models/Order';
import Bill from '../models/Bill';
import { fetchOrders } from '../services/ordersService';
import { processOrders } from '../services/billsService';


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

// Route to process orders and generate bills
router.get('/process', async (req, res) => {

    // Use Date object for date processing
    const dateParam = req.query.date as string;
    const dateToProcess = dateParam ? new Date(dateParam) : new Date(); 

    try {
      await processOrders(dateToProcess);  // Pass the date parameter to the processOrders service
      res.status(200).json({ message: 'Orders processed successfully. Bills have been generated.' });
    } catch (error) {
      console.error('Error processing orders:', error);
      res.status(500).json({ error: 'Failed to process orders. Please try again later.' });
    }
  });

// Route to view saved orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.findAll(); // Find all orders in the database
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching orders from the database' });
  }
});

router.get('/bills', async (req, res) => {
  try {
    const bills = await Bill.findAll();  // Retrieve all bills from the database
    res.status(200).json(bills);  // Return the bills as JSON
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Failed to fetch bills' });
  }
});

export { router };
