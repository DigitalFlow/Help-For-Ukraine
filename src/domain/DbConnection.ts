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
                                    schema: "help_for_ukraine"
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
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  }
}, { freezeTableName: true, timestamps: false, underscored: true });

export const Post = sequelize.define("post", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: sequelize.literal("gen_random_uuid()")
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  }
}, { freezeTableName: true, timestamps: false, underscored: true });

export const person = sequelize.define("person", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: sequelize.literal("gen_random_uuid()")
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  },
  approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { freezeTableName: true, timestamps: false, underscored: true });

person.belongsTo(User, { onDelete: "CASCADE" });

export const personSecret = sequelize.define("personsecret", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: sequelize.literal("gen_random_uuid()")
  },
  salt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  iv: {
    type: DataTypes.STRING,
    allowNull: true
  },
  secret: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  }
}, {
  freezeTableName: true,
  timestamps: false,
  underscored: true,
  indexes: [{
    unique: true,
    fields: ["person_id"]
  }]
});

personSecret.belongsTo(person, { onDelete: "CASCADE" });

export const Version = sequelize.define("version", {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: sequelize.literal("gen_random_uuid()")
  },
  version_number: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    unique: true
  },
  created_on: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal("NOW()")
  }
}, { freezeTableName: true, timestamps: false, underscored: true });