<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add data integrity check constraints to database
     */
    public function up(): void
    {
        // ============================================
        // Positive quantity checks
        // ============================================

        // Sales order items - quantity must be positive
        DB::statement("
            ALTER TABLE sales_order_items
            ADD CONSTRAINT chk_sales_order_items_positive_quantity
            CHECK (quantity > 0)
        ");

        // Sales order items - unit_price must be positive
        DB::statement("
            ALTER TABLE sales_order_items
            ADD CONSTRAINT chk_sales_order_items_positive_unit_price
            CHECK (unit_price >= 0)
        ");

        // Purchase order items - quantity must be positive
        DB::statement("
            ALTER TABLE purchase_order_items
            ADD CONSTRAINT chk_purchase_order_items_positive_quantity
            CHECK (quantity > 0)
        ");

        // Purchase order items - unit_price must be positive
        DB::statement("
            ALTER TABLE purchase_order_items
            ADD CONSTRAINT chk_purchase_order_items_positive_unit_price
            CHECK (unit_price >= 0)
        ");

        // Inventory - quantities must be non-negative
        DB::statement("
            ALTER TABLE inventory
            ADD CONSTRAINT chk_inventory_non_negative_quantities
            CHECK (
                quantity_on_hand >= 0 AND
                quantity_reserved >= 0 AND
                quantity_available >= 0 AND
                minimum_stock >= 0 AND
                maximum_stock >= 0 AND
                reorder_level >= 0
            )
        ");

        // ============================================
        // Positive amount checks
        // ============================================

        // Sales orders - amounts must be non-negative
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

        // Invoices - amounts must be non-negative
        DB::statement("
            ALTER TABLE invoices
            ADD CONSTRAINT chk_invoices_non_negative_amounts
            CHECK (
                subtotal >= 0 AND
                tax_amount >= 0 AND
                discount_amount >= 0 AND
                total_amount >= 0 AND
                paid_amount >= 0 AND
                outstanding_amount >= 0
            )
        ");

        // Purchase orders - amounts must be non-negative
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

        // Products - pricing must be non-negative
        DB::statement("
            ALTER TABLE products
            ADD CONSTRAINT chk_products_non_negative_pricing
            CHECK (
                standard_cost >= 0 AND
                selling_price >= 0 AND
                minimum_stock >= 0 AND
                reorder_level >= 0
            )
        ");

        // Customers - credit limit must be non-negative
        DB::statement("
            ALTER TABLE customers
            ADD CONSTRAINT chk_customers_non_negative_credit
            CHECK (
                credit_limit >= 0 AND
                outstanding_balance >= 0
            )
        ");

        // Suppliers - credit limit must be non-negative
        DB::statement("
            ALTER TABLE suppliers
            ADD CONSTRAINT chk_suppliers_non_negative_credit
            CHECK (credit_limit >= 0)
        ");

        // Projects - contract amount must be non-negative
        if (Schema::hasTable('projects')) {
            DB::statement("
                ALTER TABLE projects
                ADD CONSTRAINT chk_projects_non_negative_amounts
                CHECK (
                    contract_amount >= 0 AND
                    progress_percentage >= 0 AND
                    progress_percentage <= 100
                )
            ");
        }

        // ============================================
        // Percentage range checks
        // ============================================

        // Sales order items - discount percentage
        DB::statement("
            ALTER TABLE sales_order_items
            ADD CONSTRAINT chk_sales_order_items_discount_range
            CHECK (discount_percentage BETWEEN 0 AND 100)
        ");

        // Sales order items - tax percentage
        DB::statement("
            ALTER TABLE sales_order_items
            ADD CONSTRAINT chk_sales_order_items_tax_range
            CHECK (tax_percentage BETWEEN 0 AND 100)
        ");

        // Purchase order items - discount percentage
        DB::statement("
            ALTER TABLE purchase_order_items
            ADD CONSTRAINT chk_purchase_order_items_discount_range
            CHECK (discount_percentage BETWEEN 0 AND 100)
        ");

        // Purchase order items - tax percentage
        DB::statement("
            ALTER TABLE purchase_order_items
            ADD CONSTRAINT chk_purchase_order_items_tax_range
            CHECK (tax_percentage BETWEEN 0 AND 100)
        ");

        // Products - GST rate
        DB::statement("
            ALTER TABLE products
            ADD CONSTRAINT chk_products_gst_range
            CHECK (gst_rate BETWEEN 0 AND 100)
        ");

        // Customers - credit days must be non-negative
        DB::statement("
            ALTER TABLE customers
            ADD CONSTRAINT chk_customers_credit_days_positive
            CHECK (credit_days >= 0)
        ");

        // Suppliers - payment terms must be non-negative
        DB::statement("
            ALTER TABLE suppliers
            ADD CONSTRAINT chk_suppliers_payment_terms_positive
            CHECK (payment_terms_days >= 0)
        ");

        // ============================================
        // Date order checks
        // ============================================

        // Sales orders - expected delivery after order date
        DB::statement("
            ALTER TABLE sales_orders
            ADD CONSTRAINT chk_sales_orders_delivery_date_order
            CHECK (expected_delivery_date IS NULL OR expected_delivery_date >= order_date)
        ");

        // Sales orders - actual delivery after expected delivery (or order date)
        DB::statement("
            ALTER TABLE sales_orders
            ADD CONSTRAINT chk_sales_orders_actual_delivery_order
            CHECK (
                actual_delivery_date IS NULL OR
                actual_delivery_date >= COALESCE(expected_delivery_date, order_date)
            )
        ");

        // Invoices - due date after invoice date
        DB::statement("
            ALTER TABLE invoices
            ADD CONSTRAINT chk_invoices_due_date
            CHECK (due_date >= invoice_date)
        ");

        // Purchase orders - expected delivery after order date
        DB::statement("
            ALTER TABLE purchase_orders
            ADD CONSTRAINT chk_purchase_orders_delivery_date_order
            CHECK (expected_delivery_date IS NULL OR expected_delivery_date >= order_date)
        ");

        // Purchase orders - actual delivery after expected delivery
        DB::statement("
            ALTER TABLE purchase_orders
            ADD CONSTRAINT chk_purchase_orders_actual_delivery_order
            CHECK (
                actual_delivery_date IS NULL OR
                actual_delivery_date >= COALESCE(expected_delivery_date, order_date)
            )
        ");

        // Projects - end date after start date
        if (Schema::hasTable('projects')) {
            DB::statement("
                ALTER TABLE projects
                ADD CONSTRAINT chk_projects_date_order
                CHECK (end_date IS NULL OR end_date >= start_date)
            ");
        }

        // Employees - confirmation date after join date
        if (Schema::hasTable('employees')) {
            DB::statement("
                ALTER TABLE employees
                ADD CONSTRAINT chk_employee_dates_order
                CHECK (confirmation_date IS NULL OR confirmation_date >= join_date)
            ");
        }

        // Leave requests - end date after start date
        if (Schema::hasTable('leave_requests')) {
            DB::statement("
                ALTER TABLE leave_requests
                ADD CONSTRAINT chk_leave_requests_date_order
                CHECK (end_date >= start_date)
            ");
        }

        // Payroll periods - end date after start date
        if (Schema::hasTable('payroll_periods')) {
            DB::statement("
                ALTER TABLE payroll_periods
                ADD CONSTRAINT chk_payroll_periods_date_order
                CHECK (end_date >= start_date)
            ");

            // Payroll periods - payment date after end date
            DB::statement("
                ALTER TABLE payroll_periods
                ADD CONSTRAINT chk_payroll_periods_payment_date
                CHECK (payment_date >= end_date)
            ");
        }

        // ============================================
        // Delivered quantity checks
        // ============================================

        // Sales order items - delivered quantity <= ordered quantity
        DB::statement("
            ALTER TABLE sales_order_items
            ADD CONSTRAINT chk_sales_order_items_delivered_quantity
            CHECK (delivered_quantity <= quantity)
        ");

        // Purchase order items - received quantity <= ordered quantity
        DB::statement("
            ALTER TABLE purchase_order_items
            ADD CONSTRAINT chk_purchase_order_items_received_quantity
            CHECK (received_quantity <= quantity)
        ");

        // ============================================
        // Inventory quantity checks
        // ============================================

        // Inventory - reserved quantity <= on hand
        DB::statement("
            ALTER TABLE inventory
            ADD CONSTRAINT chk_inventory_reserved_vs_on_hand
            CHECK (quantity_reserved <= quantity_on_hand)
        ");

        // Inventory - available quantity = on hand - reserved
        DB::statement("
            ALTER TABLE inventory
            ADD CONSTRAINT chk_inventory_available_calculation
            CHECK (quantity_available = quantity_on_hand - quantity_reserved)
        ");

        // Inventory - minimum <= maximum
        DB::statement("
            ALTER TABLE inventory
            ADD CONSTRAINT chk_inventory_min_max_order
            CHECK (minimum_stock <= maximum_stock)
        ");

        // ============================================
        // Financial integrity checks
        // ============================================

        // Invoices - outstanding = total - paid
        DB::statement("
            ALTER TABLE invoices
            ADD CONSTRAINT chk_invoices_balance_calculation
            CHECK (outstanding_amount = total_amount - paid_amount)
        ");

        // Invoices - total = subtotal + tax - discount
        DB::statement("
            ALTER TABLE invoices
            ADD CONSTRAINT chk_invoices_total_calculation
            CHECK (total_amount = subtotal + tax_amount - discount_amount)
        ");

        // Sales orders - total = subtotal + tax - discount
        DB::statement("
            ALTER TABLE sales_orders
            ADD CONSTRAINT chk_sales_orders_total_calculation
            CHECK (total_amount = subtotal + tax_amount - discount_amount)
        ");

        // Purchase orders - total = subtotal + tax - discount
        DB::statement("
            ALTER TABLE purchase_orders
            ADD CONSTRAINT chk_purchase_orders_total_calculation
            CHECK (total_amount = subtotal + tax_amount - discount_amount)
        ");
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        // Drop all constraints added in up()

        DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT chk_sales_order_items_positive_quantity");
        DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT chk_sales_order_items_positive_unit_price");
        DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT chk_sales_order_items_discount_range");
        DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT chk_sales_order_items_tax_range");
        DB::statement("ALTER TABLE sales_order_items DROP CONSTRAINT chk_sales_order_items_delivered_quantity");

        DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT chk_purchase_order_items_positive_quantity");
        DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT chk_purchase_order_items_positive_unit_price");
        DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT chk_purchase_order_items_discount_range");
        DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT chk_purchase_order_items_tax_range");
        DB::statement("ALTER TABLE purchase_order_items DROP CONSTRAINT chk_purchase_order_items_received_quantity");

        DB::statement("ALTER TABLE inventory DROP CONSTRAINT chk_inventory_non_negative_quantities");
        DB::statement("ALTER TABLE inventory DROP CONSTRAINT chk_inventory_reserved_vs_on_hand");
        DB::statement("ALTER TABLE inventory DROP CONSTRAINT chk_inventory_available_calculation");
        DB::statement("ALTER TABLE inventory DROP CONSTRAINT chk_inventory_min_max_order");

        DB::statement("ALTER TABLE sales_orders DROP CONSTRAINT chk_sales_orders_non_negative_amounts");
        DB::statement("ALTER TABLE sales_orders DROP CONSTRAINT chk_sales_orders_delivery_date_order");
        DB::statement("ALTER TABLE sales_orders DROP CONSTRAINT chk_sales_orders_actual_delivery_order");
        DB::statement("ALTER TABLE sales_orders DROP CONSTRAINT chk_sales_orders_total_calculation");

        DB::statement("ALTER TABLE invoices DROP CONSTRAINT chk_invoices_non_negative_amounts");
        DB::statement("ALTER TABLE invoices DROP CONSTRAINT chk_invoices_due_date");
        DB::statement("ALTER TABLE invoices DROP CONSTRAINT chk_invoices_balance_calculation");
        DB::statement("ALTER TABLE invoices DROP CONSTRAINT chk_invoices_total_calculation");

        DB::statement("ALTER TABLE purchase_orders DROP CONSTRAINT chk_purchase_orders_non_negative_amounts");
        DB::statement("ALTER TABLE purchase_orders DROP CONSTRAINT chk_purchase_orders_delivery_date_order");
        DB::statement("ALTER TABLE purchase_orders DROP CONSTRAINT chk_purchase_orders_actual_delivery_order");
        DB::statement("ALTER TABLE purchase_orders DROP CONSTRAINT chk_purchase_orders_total_calculation");

        DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_non_negative_pricing");
        DB::statement("ALTER TABLE products DROP CONSTRAINT chk_products_gst_range");

        DB::statement("ALTER TABLE customers DROP CONSTRAINT chk_customers_non_negative_credit");
        DB::statement("ALTER TABLE customers DROP CONSTRAINT chk_customers_credit_days_positive");

        DB::statement("ALTER TABLE suppliers DROP CONSTRAINT chk_suppliers_non_negative_credit");
        DB::statement("ALTER TABLE suppliers DROP CONSTRAINT chk_suppliers_payment_terms_positive");

        if (Schema::hasTable('projects')) {
            DB::statement("ALTER TABLE projects DROP CONSTRAINT chk_projects_non_negative_amounts");
            DB::statement("ALTER TABLE projects DROP CONSTRAINT chk_projects_date_order");
        }

        if (Schema::hasTable('employees')) {
            DB::statement("ALTER TABLE employees DROP CONSTRAINT chk_employee_dates_order");
        }

        if (Schema::hasTable('leave_requests')) {
            DB::statement("ALTER TABLE leave_requests DROP CONSTRAINT chk_leave_requests_date_order");
        }

        if (Schema::hasTable('payroll_periods')) {
            DB::statement("ALTER TABLE payroll_periods DROP CONSTRAINT chk_payroll_periods_date_order");
            DB::statement("ALTER TABLE payroll_periods DROP CONSTRAINT chk_payroll_periods_payment_date");
        }
    }
};
