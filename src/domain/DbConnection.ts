import { Pool, PoolConfig, QueryResult } from "pg";
import { Sequelize, DataTypes } from "sequelize";

console.log("Constructing DB pool");

const poolConfig = {
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE
};

// Connect to mysql
export const pool = new Pool(poolConfig);

export const sequelize = new Sequelize(process.env.DB_DATABASE || "postgres",
                                process.env.DB_USER || "postgres",
                                process.env.DB_PASSWORD || "postgres",
                                {
                                    host: process.env.DB_HOST || "postgres",
                                    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
                                    dialect: "postgres",
                                    dialectOptions: {
                                        ssl: process.env.DB_SSL == "true"
                                    },
                                    schema: "open_certification_trainer"
                                });

export const User = sequelize.define("user", {
  id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: sequelize.literal("gen_random_uuid()")
  },
  user_name: {
      type: DataTypes.STRING,
      allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  }
}, { freezeTableName: true });