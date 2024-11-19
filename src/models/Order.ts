import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/database';

class Order extends Model {
  public id!: number;
  public item!: string;
  public customer!: string;
  public billingFrequency!: 'daily' | 'weekly' | 'monthly';
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    billingFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false,
  }
);

export default Order;
