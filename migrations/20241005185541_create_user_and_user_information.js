/**
 * Migration for creating user and user_information tables
 * @param { import("knex").Knex } knex
 */
exports.up = async function (knex) {
  // Create `user` table
  await knex.schema.createTable("user", (table) => {
    table.string("userId").primary(); // Primary key
    table.string("language"); // Language preference
    table.tinyint("credits").defaultTo(0); // Default to 0
    table.dateTime("createdAt").defaultTo(knex.fn.now()); // Default to current timestamp
    table.dateTime("updatedAt").defaultTo(knex.fn.now());
  });

  // Create `user_facts` table
  await knex.schema.createTable("user_facts", (table) => {
    table.increments("id"); // Auto-incrementing ID
    table.string("userId").notNullable().references("userId").inTable("user"); // Foreign key to `user` table
    table.string("fact");
    table.dateTime("createdAt").defaultTo(knex.fn.now());
    table.unique(["userId", "fact"]);
  });
};

/**
 * Drop the `user` and `user_facts` tables
 * @param { import("knex").Knex } knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_facts");
  await knex.schema.dropTableIfExists("user");
};
