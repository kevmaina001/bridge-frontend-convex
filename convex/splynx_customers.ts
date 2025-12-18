import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Get all Splynx customers with pagination
export const getSplynxCustomers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;

    const customers = await ctx.db
      .query("splynx_customers")
      .order("desc")
      .collect();

    return customers.slice(offset, offset + limit);
  },
});

// Query: Get customer by Splynx ID
export const getSplynxCustomerById = query({
  args: { splynxId: v.string() },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("splynx_customers")
      .withIndex("by_splynx_id", (q) => q.eq("splynx_id", args.splynxId))
      .first();

    return customer;
  },
});

// Query: Get customer by login
export const getSplynxCustomerByLogin = query({
  args: { login: v.string() },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("splynx_customers")
      .withIndex("by_login", (q) => q.eq("login", args.login))
      .first();

    return customer;
  },
});

// Query: Get customer statistics
export const getSplynxCustomerStats = query({
  args: {},
  handler: async (ctx) => {
    const allCustomers = await ctx.db.query("splynx_customers").collect();

    const totalCustomers = allCustomers.length;
    const activeCustomers = allCustomers.filter(c => c.status === 'active').length;
    const inactiveCustomers = allCustomers.filter(c => c.status === 'inactive').length;

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
    };
  },
});

// Query: Search customers by name, email, or login
export const searchSplynxCustomers = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const allCustomers = await ctx.db.query("splynx_customers").collect();

    const searchLower = args.searchTerm.toLowerCase();
    const filtered = allCustomers.filter(customer => {
      const name = (customer.name || '').toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const login = (customer.login || '').toLowerCase();
      const splynxId = (customer.splynx_id || '').toLowerCase();

      return name.includes(searchLower) ||
             email.includes(searchLower) ||
             login.includes(searchLower) ||
             splynxId.includes(searchLower);
    });

    return filtered;
  },
});

// Mutation: Upsert customer (insert or update)
export const upsertSplynxCustomer = mutation({
  args: {
    splynx_id: v.string(),
    login: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    status: v.optional(v.string()),
    billing_type: v.optional(v.string()),
    category: v.optional(v.string()),
    street_1: v.optional(v.string()),
    city: v.optional(v.string()),
    zip_code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if customer exists
    const existing = await ctx.db
      .query("splynx_customers")
      .withIndex("by_splynx_id", (q) => q.eq("splynx_id", args.splynx_id))
      .first();

    if (existing) {
      // Update existing customer
      await ctx.db.patch(existing._id, {
        login: args.login,
        name: args.name,
        email: args.email,
        phone: args.phone,
        status: args.status,
        billing_type: args.billing_type,
        category: args.category,
        street_1: args.street_1,
        city: args.city,
        zip_code: args.zip_code,
        synced_at: Date.now(),
        updated_at: Date.now(),
      });

      return { id: existing._id, action: "updated" };
    } else {
      // Insert new customer
      const id = await ctx.db.insert("splynx_customers", {
        splynx_id: args.splynx_id,
        login: args.login,
        name: args.name,
        email: args.email,
        phone: args.phone,
        status: args.status,
        billing_type: args.billing_type,
        category: args.category,
        street_1: args.street_1,
        city: args.city,
        zip_code: args.zip_code,
        created_at: Date.now(),
        updated_at: Date.now(),
        synced_at: Date.now(),
      });

      return { id, action: "inserted" };
    }
  },
});

// Mutation: Bulk upsert customers (for syncing from Splynx)
export const bulkUpsertSplynxCustomers = mutation({
  args: {
    customers: v.array(v.object({
      splynx_id: v.string(),
      login: v.optional(v.string()),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      status: v.optional(v.string()),
      billing_type: v.optional(v.string()),
      category: v.optional(v.string()),
      street_1: v.optional(v.string()),
      city: v.optional(v.string()),
      zip_code: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    let insertedCount = 0;
    let updatedCount = 0;

    for (const customerData of args.customers) {
      const existing = await ctx.db
        .query("splynx_customers")
        .withIndex("by_splynx_id", (q) => q.eq("splynx_id", customerData.splynx_id))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          login: customerData.login,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          status: customerData.status,
          billing_type: customerData.billing_type,
          category: customerData.category,
          street_1: customerData.street_1,
          city: customerData.city,
          zip_code: customerData.zip_code,
          synced_at: Date.now(),
          updated_at: Date.now(),
        });
        updatedCount++;
      } else {
        await ctx.db.insert("splynx_customers", {
          splynx_id: customerData.splynx_id,
          login: customerData.login,
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          status: customerData.status,
          billing_type: customerData.billing_type,
          category: customerData.category,
          street_1: customerData.street_1,
          city: customerData.city,
          zip_code: customerData.zip_code,
          created_at: Date.now(),
          updated_at: Date.now(),
          synced_at: Date.now(),
        });
        insertedCount++;
      }
    }

    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      total: args.customers.length,
    };
  },
});
