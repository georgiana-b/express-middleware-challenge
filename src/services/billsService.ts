import { IntegerDataType, Op } from 'sequelize';
import Order from '../models/Order'; // Correct relative path from services to models
import Bill from '../models/Bill';
import axios from 'axios';

const SERVICE_B_URL = 'https://ie24.challenge.dev.kanpla.io/api/service-b';

// Helper method to send orders to Service B
const sendToServiceB = (orders: any[]) => {
  console.log('Sending orders to Service B:', orders);

  return axios
    .post(
      SERVICE_B_URL,
      { orders },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => response.data.billing) // Return the billing information from the response
    .catch((error) => {
      console.error('Error sending to Service B:', error);
      return Promise.reject(new Error('Failed to send orders to Service B'));
    });
};

// Helper function to check if a bill already exists for the day
const checkBillAlreadySubmitted = (date: Date): Promise<boolean> => {
  return Bill.findOne({
    where: {
      submittedAt: {
        [Op.gte]: new Date(date.setHours(0, 0, 0, 0)), // Start of the day (midnight)
        [Op.lt]: new Date(date.setHours(23, 59, 59, 999)), // End of the day (11:59:59.999)
      },
    },
  })
    .then((existingBill) => {
      console.log(existingBill);
      return !!existingBill; // Return true if a bill was found
    })
    .catch((error) => {
      console.error('Error checking bill submission:', error);
      return Promise.reject(new Error('Failed to check bill submission'));
    });
};

// Function to process orders and submit to Service B
export const processOrders = (date: Date): Promise<void> => {
  const today = new Date();
  const dateToProcess = date ? new Date(date) : today; // Default to today's date if no date is provided
  const isMonday = today.getDay() === 1; // Monday check remains the same
  const isFirstDayOfMonth = today.getDate() === 1;

  return checkBillAlreadySubmitted(dateToProcess)
    .then((isBillSubmitted) => {
      if (isBillSubmitted) {
        console.log(`A bill has already been submitted for ${date}. No new bills will be submitted.`);
        return Promise.resolve(); // Exit early
      }

      // Collect daily orders
      return Order.findAll({ where: { billingFrequency: 'daily' } })
        .then((dailyOrders) => {
          const weeklyOrdersPromise = isMonday
            ? Promise.resolve([]) // No weekly orders if not Monday
            : Order.findAll({ where: { billingFrequency: 'weekly' } });

          const monthlyOrdersPromise = isFirstDayOfMonth
            ? Order.findAll({ where: { billingFrequency: 'monthly' } })
            : Promise.resolve([]);

          return Promise.all([dailyOrders, weeklyOrdersPromise, monthlyOrdersPromise]);
        })
        .then(([dailyOrders, weeklyOrders, monthlyOrders]) => {
          const ordersToSubmit = [...dailyOrders, ...weeklyOrders, ...monthlyOrders];

          if (ordersToSubmit.length === 0) {
            console.log('No orders to process.');
            return Promise.resolve();
          }

          // Prepare orders for batch submission to Service B
          const ordersPayload = ordersToSubmit.map((order) => ({
            id: order.id,
            item: order.item,
            customer: order.customer,
          }));

          return sendToServiceB(ordersPayload).then((response) => {
            // Iterate over the response and create a Bill entry for each order
            const bills = response.map((orderResponse: any) => ({
              orderId: orderResponse.id,
              item: orderResponse.item,
              customer: orderResponse.customer,
              submittedId: orderResponse.submittedId,
              submittedAt: orderResponse.submittedAt,
            }));

            // Save the generated bills into the database
            return Bill.bulkCreate(bills).then(() => {
              console.log('Bills successfully created for the orders.');
            });
          });
        });
    })
    .catch((error) => {
      console.error('Error processing orders:', error);
      return Promise.reject(new Error('Failed to process orders'));
    });
};
