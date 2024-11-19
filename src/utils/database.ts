import { Sequelize } from 'sequelize';

// Initialize Sequelize (use SQLite in this case)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // SQLite file location
});

export default sequelize;
