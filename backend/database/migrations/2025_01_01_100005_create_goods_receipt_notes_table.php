<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goods_receipt_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('supplier_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->nullable()->constrained()->onDelete('set null');
            $table->string('grn_number')->unique();
            $table->date('grn_date');
            $table->string('vehicle_number')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('lr_number')->nullable(); // Lorry Receipt Number
            $table->text('remarks')->nullable();
            $table->foreignId('received_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('inspected_by')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending_inspection', 'accepted', 'partially_accepted', 'rejected'])->default('pending_inspection');
            $table->json('attachments')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'purchase_order_id']);
            $table->index('grn_number');
            $table->index('grn_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_notes');
    }
};
