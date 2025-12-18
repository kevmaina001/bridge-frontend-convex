import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Query: Get all customer mappings with enriched data
export const getCustomerMappings = query({
  args: {},
  handler: async (ctx) => {
    const mappings = await ctx.db.query("customer_mappings").collect();

    // Enrich each mapping with Splynx customer and UISP client data
    const enrichedMappings = await Promise.all(
      mappings.map(async (mapping) => {
        // Get Splynx customer
        const splynxCustomer = await ctx.db
          .query("splynx_customers")
          .withIndex("by_splynx_id", (q) => q.eq("splynx_id", mapping.splynx_customer_id))
          .first();

        // Get UISP client
        const uispClient = await ctx.db
          .query("clients")
          .withIndex("by_uisp_client_id", (q) => q.eq("uisp_client_id", mapping.uisp_client_id.toString()))
          .first();

        return {
          ...mapping,
          splynx_customer: splynxCustomer || null,
          uisp_client: uispClient || null,
        };
      })
    );

    return enrichedMappings;
  },
});

// Query: Get mapping statistics
export const getMappingStats = query({
  args: {},
  handler: async (ctx) => {
    const mappings = await ctx.db.query("customer_mappings").collect();
    const splynxCustomers = await ctx.db.query("splynx_customers").collect();
    const uispClients = await ctx.db.query("clients").collect();

    return {
      totalMappings: mappings.length,
      totalSplynxCustomers: splynxCustomers.length,
      totalUispClients: uispClients.length,
      unmappedSplynxCustomers: splynxCustomers.length - mappings.length,
      unmappedUispClients: uispClients.length - mappings.length,
    };
  },
});

// Mutation: Create or update a customer mapping
export const upsertCustomerMapping = mutation({
  args: {
    splynx_customer_id: v.string(),
    uisp_client_id: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if mapping already exists
    const existing = await ctx.db
      .query("customer_mappings")
      .withIndex("by_splynx_customer_id", (q) => q.eq("splynx_customer_id", args.splynx_customer_id))
      .first();

    if (existing) {
      // Update existing mapping
      await ctx.db.patch(existing._id, {
        uisp_client_id: args.uisp_client_id,
        notes: args.notes,
        updated_at: Date.now(),
      });

      return { id: existing._id, action: "updated" };
    } else {
      // Insert new mapping
      const id = await ctx.db.insert("customer_mappings", {
        splynx_customer_id: args.splynx_customer_id,
        uisp_client_id: args.uisp_client_id,
        notes: args.notes,
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      return { id, action: "inserted" };
    }
  },
});

// Mutation: Delete a customer mapping
export const deleteCustomerMapping = mutation({
  args: { mappingId: v.id("customer_mappings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.mappingId);
    return { success: true, message: "Mapping deleted" };
  },
});
