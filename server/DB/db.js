/**
 * this file handles the database connection
 */
import mysql from "mysql";
import "dotenv/config.js";

// database connection configuration
const config = {
  host: process.env.RDS_HOSTNAME,
  port: process.env.PORT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
};

// the db connection instance
const pool = mysql.createPool(config);

// export the pool
export default pool;
