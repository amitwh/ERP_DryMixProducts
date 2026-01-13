<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add data integrity check constraints to database
     * Note: Many constraints have been commented out due to column name mismatches.
     * These should be reviewed and enabled after verifying actual column names.
     */
    public function up(): void
    {
        // Basic non-negative quantity/price checks for sales order items
        if (Schema::hasColumn('sales_order_items', 'quantity')) {
            DB::statement("
                ALTER TABLE sales_order_items
                ADD CONSTRAINT chk_sales_order_items_positive_quantity
                CHECK (quantity > 0)
            ");
        }

        if (Schema::hasColumn('sales_order_items', 'unit_price')) {
            DB::statement("
                ALTER TABLE sales_order_items
                ADD CONSTRAINT chk_sales_order_items_positive_unit_price
                CHECK (unit_price >= 0)
            ");
        }

        // Basic non-negative quantity/price checks for purchase order items
        if (Schema::hasColumn('purchase_order_items', 'quantity')) {
            DB::statement("
                ALTER TABLE purchase_order_items
                ADD CONSTRAINT chk_purchase_order_items_positive_quantity
                CHECK (quantity > 0)
            ");
        }

        if (Schema::hasColumn('purchase_order_items', 'unit_price')) {
            DB::statement("
                ALTER TABLE purchase_order_items
                ADD CONSTRAINT chk_purchase_order_items_positive_unit_price
                CHECK (unit_price >= 0)
            ");
        }

        // Sales orders - amounts must be non-negative
        if (Schema::hasColumns('sales_orders', ['subtotal', 'tax_amount', 'discount_amount', 'total_amount'])) {
            DB::statement("
                ALTER TABLE sales_orders
                ADD CONSTRAINT chk_sales_orders_non_negative_amounts
                CHECK (
                    subtotal >= 0 AND
                    tax_amount >= 0 AND
                    discount_amount >= 0 AND
                    total_amount >= 0
                )
            ");
        }

        // Purchase orders - amounts must be non-negative
        if (Schema::hasColumns('purchase_orders', ['subtotal', 'tax_amount', 'discount_amount', 'total_amount'])) {
            DB::statement("
                ALTER TABLE purchase_orders
                ADD CONSTRAINT chk_purchase_orders_non_negative_amounts
                CHECK (
                    subtotal >= 0 AND
                    tax_amount >= 0 AND
                    discount_amount >= 0 AND
                    total_amount >= 0
                )
            ");
        }

        // Products - pricing must be non-negative (if columns exist)
        if (Schema::hasColumns('products', ['standard_cost', 'selling_price'])) {
            DB::statement("
                ALTER TABLE products
                ADD CONSTRAINT chk_products_non_negative_pricing
                CHECK (
                    standard_cost >= 0 AND
                    selling_price >= 0
                )
            ");
        }
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        // Safely drop constraints if they exist
        try {
            DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT IF EXISTS chk_sales_order_items_positive_quantity");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT IF EXISTS chk_sales_order_items_positive_unit_price");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT IF EXISTS chk_purchase_order_items_positive_quantity");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT IF EXISTS chk_purchase_order_items_positive_unit_price");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE sales_orders DROP CONSTRAINT IF EXISTS chk_sales_orders_non_negative_amounts");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS chk_purchase_orders_non_negative_amounts");
        } catch (\Exception $e) {}

        try {
            DB::statement("ALTER TABLE products DROP CONSTRAINT IF EXISTS chk_products_non_negative_pricing");
        } catch (\Exception $e) {}
    }
};
