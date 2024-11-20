import { Router } from 'express';
import Order from '../models/Order';
import Bill from '../models/Bill';
import { fetchOrders } from '../services/ordersService';
import { processOrders } from '../services/billsService';

const router = Router();

// Route to download orders from Service A
router.get('/download', (req, res) => {
  fetchOrders()
    .then((orders) => {
      res.status(200).json({ message: 'Orders fetched and saved', orders });
    })
    .catch((error) => {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'An error occurred while fetching orders' });
    });
});

// Route to process orders and generate bills
router.get('/process', (req, res) => {
  const dateParam = req.query.date as string;
  const dateToProcess = dateParam ? new Date(dateParam) : new Date();

  processOrders(dateToProcess)
    .then(() => {
      res
        .status(200)
        .json({ message: 'Orders processed successfully. Bills have been generated.' });
    })
    .catch((error) => {
      console.error('Error processing orders:', error);
      res.status(500).json({ error: 'Failed to process orders. Please try again later.' });
    });
});

// Route to view saved orders
router.get('/', (req, res) => {
  Order.findAll()
    .then((orders) => res.status(200).json(orders))
    .catch((error) => {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'An error occurred while fetching orders from the database' });
    });
});

// Route to view saved bills
router.get('/bills', (req, res) => {
  Bill.findAll()
    .then((bills) => res.status(200).json(bills))
    .catch((error) => {
      console.error('Error fetching bills:', error);
      res.status(500).json({ error: 'Failed to fetch bills' });
    });
});

export { router };
