<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add missing performance indexes to optimize query performance
     */
    public function up(): void
    {
        // ============================================
        // Date-based query indexes for sorting/filtering
        // ============================================

        // Sales orders - created_at for recent orders
        Schema::table('sales_orders', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('sales_orders'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_sales_orders_created_at');
            }
        });

        // Invoices - created_at for recent invoices
        Schema::table('invoices', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('invoices'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_invoices_created_at');
            }
        });

        // Purchase orders - created_at for recent POs
        Schema::table('purchase_orders', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('purchase_orders'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_purchase_orders_created_at');
            }
        });

        // Inventory - created_at for recent stock movements
        Schema::table('inventory', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('inventory'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_inventory_created_at');
            }
        });

        // Products - created_at for product listings
        Schema::table('products', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('products'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_products_created_at');
            }
        });

        // Customers - created_at for customer listings
        Schema::table('customers', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('customers'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_customers_created_at');
            }
        });

        // Suppliers - created_at for supplier listings
        Schema::table('suppliers', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('suppliers'))->contains('idx_created_at')) {
                $table->index('created_at', 'idx_suppliers_created_at');
            }
        });

        // ============================================
        // Composite indexes for status + date filtering
        // ============================================

        // Invoices - overdue queries (status, due_date)
        Schema::table('invoices', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('invoices'))->contains('idx_status_due_date')) {
                $table->index(['status', 'due_date'], 'idx_invoices_status_due_date');
            }
        });

        // Sales orders - status filtering with date
        Schema::table('sales_orders', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('sales_orders'))->contains('idx_status_order_date')) {
                $table->index(['status', 'order_date'], 'idx_sales_orders_status_order_date');
            }
        });

        // Purchase orders - status filtering with date
        Schema::table('purchase_orders', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('purchase_orders'))->contains('idx_status_order_date')) {
                $table->index(['status', 'order_date'], 'idx_purchase_orders_status_order_date');
            }
        });

        // Production orders - status filtering with date
        Schema::table('production_orders', function (Blueprint $table) {
            if (Schema::hasTable('production_orders')) {
                if (!collect(Schema::getColumnListing('production_orders'))->contains('idx_status_order_date')) {
                    $table->index(['status', 'planned_start_date'], 'idx_production_orders_status_start_date');
                }
            }
        });

        // ============================================
        // Composite unique keys - organization + code
        // (Ensures codes are unique within organization)
        // ============================================

        // Customers - organization_id + code
        Schema::table('customers', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('customers'))->contains('unique_org_code')) {
                $table->unique(['organization_id', 'code'], 'unique_customers_org_code');
            }
        });

        // Suppliers - organization_id + code
        Schema::table('suppliers', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('suppliers'))->contains('unique_org_code')) {
                $table->unique(['organization_id', 'code'], 'unique_suppliers_org_code');
            }
        });

        // Products - organization_id + code
        Schema::table('products', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('products'))->contains('unique_org_code')) {
                $table->unique(['organization_id', 'code'], 'unique_products_org_code');
            }
        });

        // Projects - organization_id + project_number
        Schema::table('projects', function (Blueprint $table) {
            if (Schema::hasTable('projects')) {
                if (!collect(Schema::getColumnListing('projects'))->contains('unique_org_project_number')) {
                    $table->unique(['organization_id', 'project_number'], 'unique_projects_org_number');
                }
            }
        });

        // ============================================
        // Numeric range queries indexes
        // ============================================

        // Inventory - quantity_on_hand for stock reports
        Schema::table('inventory', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('inventory'))->contains('idx_qty_on_hand')) {
                $table->index('quantity_on_hand', 'idx_inventory_qty_on_hand');
            }
            if (!collect(Schema::getColumnListing('inventory'))->contains('idx_quantity_available')) {
                $table->index('quantity_available', 'idx_inventory_quantity_available');
            }
        });

        // Products - standard_cost and selling_price for pricing reports
        Schema::table('products', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('products'))->contains('idx_standard_cost')) {
                $table->index('standard_cost', 'idx_products_standard_cost');
            }
            if (!collect(Schema::getColumnListing('products'))->contains('idx_selling_price')) {
                $table->index('selling_price', 'idx_products_selling_price');
            }
        });

        // Sales orders - total_amount for revenue reports
        Schema::table('sales_orders', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('sales_orders'))->contains('idx_total_amount')) {
                $table->index('total_amount', 'idx_sales_orders_total_amount');
            }
        });

        // Invoices - outstanding_amount for aging reports
        Schema::table('invoices', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('invoices'))->contains('idx_outstanding_amount')) {
                $table->index('outstanding_amount', 'idx_invoices_outstanding_amount');
            }
        });

        // ============================================
        // Full-text search indexes for text fields
        // ============================================

        // Products - name and description for product search
        Schema::table('products', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('products'))->contains('ft_name_description')) {
                $table->fullText(['name', 'description'], 'ft_products_name_description');
            }
        });

        // Customers - name and billing_address for customer search
        Schema::table('customers', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('customers'))->contains('ft_name_address')) {
                $table->fullText(['name', 'billing_address'], 'ft_customers_name_address');
            }
        });

        // Suppliers - name and address for supplier search
        Schema::table('suppliers', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('suppliers'))->contains('ft_name_address')) {
                $table->fullText(['name', 'address'], 'ft_suppliers_name_address');
            }
        });

        // ============================================
        // Additional composite indexes for common queries
        // ============================================

        // Sales order items - sales_order_id + product_id + delivered_quantity
        Schema::table('sales_order_items', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('sales_order_items'))->contains('idx_order_product_qty')) {
                $table->index(['sales_order_id', 'product_id', 'delivered_quantity'], 'idx_sales_order_items_order_product_qty');
            }
        });

        // Purchase order items - purchase_order_id + product_id + received_quantity
        Schema::table('purchase_order_items', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('purchase_order_items'))->contains('idx_order_product_qty')) {
                $table->index(['purchase_order_id', 'product_id', 'received_quantity'], 'idx_purchase_order_items_order_product_qty');
            }
        });

        // Stock transactions - inventory_id + created_at for transaction history
        Schema::table('stock_transactions', function (Blueprint $table) {
            if (!collect(Schema::getColumnListing('stock_transactions'))->contains('idx_inventory_date')) {
                $table->index(['inventory_id', 'created_at'], 'idx_stock_transactions_inventory_date');
            }
        });

        // ============================================
        // Quality control tables indexes
        // ============================================

        if (Schema::hasTable('inspections')) {
            Schema::table('inspections', function (Blueprint $table) {
                if (!collect(Schema::getColumnListing('inspections'))->contains('idx_status_date')) {
                    $table->index(['status', 'inspection_date'], 'idx_inspections_status_date');
                }
            });
        }

        if (Schema::hasTable('ncrs')) {
            Schema::table('ncrs', function (Blueprint $table) {
                if (!collect(Schema::getColumnListing('ncrs'))->contains('idx_status_severity_date')) {
                    $table->index(['status', 'severity', 'created_at'], 'idx_ncrs_status_severity_date');
                }
            });
        }

        // ============================================
        // Finance tables indexes
        // ============================================

        if (Schema::hasTable('journal_vouchers')) {
            Schema::table('journal_vouchers', function (Blueprint $table) {
                if (!collect(Schema::getColumnListing('journal_vouchers'))->contains('idx_voucher_date')) {
                    $table->index('voucher_date', 'idx_journal_vouchers_date');
                }
                if (!collect(Schema::getColumnListing('journal_vouchers'))->contains('idx_status_type')) {
                    $table->index(['status', 'voucher_type'], 'idx_journal_vouchers_status_type');
                }
            });
        }

        if (Schema::hasTable('ledgers')) {
            Schema::table('ledgers', function (Blueprint $table) {
                if (!collect(Schema::getColumnListing('ledgers'))->contains('idx_account_date')) {
                    $table->index(['account_id', 'entry_date'], 'idx_ledgers_account_date');
                }
            });
        }
    }

    /**
     * Reverse the migrations
     */
    public function down(): void
    {
        // Drop all indexes added in up()

        Schema::table('sales_orders', function (Blueprint $table) {
            $table->dropIndex('idx_sales_orders_created_at');
            $table->dropIndex('idx_sales_orders_status_order_date');
            $table->dropIndex('idx_sales_orders_total_amount');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_created_at');
            $table->dropIndex('idx_invoices_status_due_date');
            $table->dropIndex('idx_invoices_outstanding_amount');
        });

        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->dropIndex('idx_purchase_orders_created_at');
            $table->dropIndex('idx_purchase_orders_status_order_date');
        });

        Schema::table('inventory', function (Blueprint $table) {
            $table->dropIndex('idx_inventory_created_at');
            $table->dropIndex('idx_inventory_qty_on_hand');
            $table->dropIndex('idx_inventory_quantity_available');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('idx_products_created_at');
            $table->dropIndex('idx_products_standard_cost');
            $table->dropIndex('idx_products_selling_price');
            $table->dropFullText('ft_products_name_description');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropIndex('idx_customers_created_at');
            $table->dropUnique('unique_customers_org_code');
            $table->dropFullText('ft_customers_name_address');
        });

        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropIndex('idx_suppliers_created_at');
            $table->dropUnique('unique_suppliers_org_code');
            $table->dropFullText('ft_suppliers_name_address');
        });

        Schema::table('sales_order_items', function (Blueprint $table) {
            $table->dropIndex('idx_sales_order_items_order_product_qty');
        });

        Schema::table('purchase_order_items', function (Blueprint $table) {
            $table->dropIndex('idx_purchase_order_items_order_product_qty');
        });

        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_stock_transactions_inventory_date');
        });

        if (Schema::hasTable('projects')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropUnique('unique_projects_org_number');
            });
        }

        if (Schema::hasTable('production_orders')) {
            Schema::table('production_orders', function (Blueprint $table) {
                $table->dropIndex('idx_production_orders_status_start_date');
            });
        }

        if (Schema::hasTable('inspections')) {
            Schema::table('inspections', function (Blueprint $table) {
                $table->dropIndex('idx_inspections_status_date');
            });
        }

        if (Schema::hasTable('ncrs')) {
            Schema::table('ncrs', function (Blueprint $table) {
                $table->dropIndex('idx_ncrs_status_severity_date');
            });
        }

        if (Schema::hasTable('journal_vouchers')) {
            Schema::table('journal_vouchers', function (Blueprint $table) {
                $table->dropIndex('idx_journal_vouchers_date');
                $table->dropIndex('idx_journal_vouchers_status_type');
            });
        }

        if (Schema::hasTable('ledgers')) {
            Schema::table('ledgers', function (Blueprint $table) {
                $table->dropIndex('idx_ledgers_account_date');
            });
        }
    }
};
