import { IntegerDataType, Op } from 'sequelize';
import Order from '../models/Order';  // Correct relative path from services to models
import Bill from '../models/Bill';
import axios from 'axios';

const SERVICE_B_URL = 'https://ie24.challenge.dev.kanpla.io/api/service-b';

// Helper method to send orders to Service B
const sendToServiceB = async (orders: any[]) => {
  console.log('Sending orders to Service B:', orders);  // Log the orders being sent

  try {
    const response = await axios.post(
      SERVICE_B_URL,
      { orders },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.billing;  // Return the billing information from the response
  } catch (error) {
    console.error('Error sending to Service B:', error);
    throw new Error('Failed to send orders to Service B');
  }
};

// Helper function to check if a bill already exists for the day
const checkBillAlreadySubmitted = async (date: Date): Promise<boolean> => {
  const existingBill = await Bill.findOne({
    where: {
      submittedAt: {
        [Op.gte]: new Date(date.setHours(0, 0, 0, 0)),  // Start of the day (midnight)
        [Op.lt]: new Date(date.setHours(23, 59, 59, 999)), // End of the day (11:59:59.999)
      }
    },
  });
  console.log(existingBill)
  return !!existingBill;  // Return true if a bill was found, meaning it's already been submitted
};

// Function to process orders and submit to Service B
export const processOrders = async (date: Date): Promise<void> => {
  const today = new Date();
  const dateToProcess = date ? new Date(date) : today;  // Default to today's date if no date is provided
  const isMonday = today.getDay() === 1;  // Monday check remains the same
  const isFirstDayOfMonth = today.getDate() === 1;  

  // Check if a bill has already been submitted today
  const isBillSubmitted = await checkBillAlreadySubmitted(dateToProcess);
  if (isBillSubmitted) {
    console.log(`A bill has already been submitted for ${date}. No new bills will be submitted.`);
    return;  // Exit if a bill has already been submitted for today
  }

  // Collect daily orders
  const dailyOrders = await Order.findAll({
    where: { billingFrequency: 'daily' },
  });

  // Collect weekly orders if today is Monday
  const weeklyOrders = isMonday ? [] : await Order.findAll({
    where: { billingFrequency: 'weekly' },
  });

  // Collect monthly orders if today is the first day of the month
  const monthlyOrders = isFirstDayOfMonth ? await Order.findAll({
    where: { billingFrequency: 'monthly' },
  }) : [];

  const ordersToSubmit = [...dailyOrders, ...weeklyOrders, ...monthlyOrders];
  
  if (ordersToSubmit.length === 0) {
    console.log('No orders to process.');
    return;
  }

  // Prepare orders for batch submission to Service B
  const ordersPayload = ordersToSubmit.map(order => ({
    id: order.id,
    item: order.item,
    customer: order.customer,
  }));

  try {
    // Send the orders to Service B
    const response = await sendToServiceB(ordersPayload)

    // Iterate over the response and create a Bill entry for each order
    const bills = response.map((orderResponse: any) => ({
      orderId: orderResponse.id,
      item: orderResponse.item,
      customer: orderResponse.customer,
      submittedId: orderResponse.submittedId,
      submittedAt: orderResponse.submittedAt,
    }));

    // Save the generated bills into the database
    await Bill.bulkCreate(bills);

    console.log('Bills successfully created for the orders.');
  } catch (error) {
    console.error('Error processing orders:', error);
    throw new Error('Failed to submit orders to Service B');
  }
};
