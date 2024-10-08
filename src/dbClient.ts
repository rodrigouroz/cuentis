import knex from "knex";
import knexConfig from "../knexfile";
import { env } from "process";

// Determine the environment (default to 'development')
const environment = env.NODE_ENV || "development";

// Initialize a Knex instance using the configuration from knexfile.js
const db = knex(knexConfig[environment]);

export default db;
