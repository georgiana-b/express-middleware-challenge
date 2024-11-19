import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';

class Bill extends Model {
  public id!: number;
  public item!: string;
  public orderId!: number;
  public customer!: string;
  public submittedId!: string;
  public submittedAt!: Date;
}

Bill.init(
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
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    submittedId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Bill',
    tableName: 'bills',
    timestamps: false,
  }
);

export default Bill;


