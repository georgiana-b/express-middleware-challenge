import express from 'express';
import sequelize from './utils/database';
import { router as ordersRoute } from './routes/orders';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/orders', ordersRoute);

// Sync database (creates table if it doesn't exist)
sequelize.sync().then(() => {
    console.log('Database synced!');
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
});