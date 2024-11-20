import axios from 'axios';
import Order from '../models/Order'; // Import the Sequelize Order model

const SERVICE_A_URL = 'https://ie24.challenge.dev.kanpla.io/api/service-a';

// Helper function to save orders to the database
const saveOrdersToDatabase = (orders: any[]): Promise<void> => {
  const upsertPromises = orders.map((order) =>
    Order.upsert({
      id: order.id,
      item: order.item,
      customer: order.customer,
      billingFrequency: order.billingFrequency,
    })
  );

  return Promise.all(upsertPromises)
    .then(() => console.log('Orders successfully saved to the database.'))
    .catch((error) => {
      console.error('Error saving orders to the database:', error);
      return Promise.reject(new Error('Failed to save orders to the database'));
    });
};

// Fetch and save orders, iterating through all pages
export const fetchOrders = (): Promise<any[]> => {
  const limit = 10;
  let page = 1;
  const allOrders: any[] = [];
  let hasMoreOrders = true;

  const fetchNextPage = (): Promise<any[]> => {
    if (!hasMoreOrders) {
      return Promise.resolve(allOrders); // Return all collected orders when done
    }

    return axios
      .get(SERVICE_A_URL, { params: { page, limit } })
      .then((response) => {
        const { orders } = response.data;

        if (Array.isArray(orders) && orders.length > 0) {
          allOrders.push(...orders);
          page += 1; // Increment page for the next request

          return saveOrdersToDatabase(orders).then(() => fetchNextPage()); // Save orders and recursively fetch the next page
        } else {
          hasMoreOrders = false; // Stop fetching if no orders are returned
          return allOrders;
        }
      })
      .catch((error) => {
        console.error('Error fetching orders from Service A:', error);
        return Promise.reject(new Error('Failed to fetch orders from Service A'));
      });
  };

  return fetchNextPage();
};

// Fetch orders from the database
export const getOrdersFromDatabase = (): Promise<any[]> => {
  return Order.findAll()
    .then((orders) => orders)
    .catch((error) => {
      console.error('Error fetching orders from the database:', error);
      return Promise.reject(new Error('Failed to fetch orders from the database'));
    });
};
