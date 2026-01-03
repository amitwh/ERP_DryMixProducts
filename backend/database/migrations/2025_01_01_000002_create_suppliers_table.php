<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('supplier_type')->default('manufacturer');
            $table->string('contact_person')->nullable();
            $table->string('phone');
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->default('India');
            $table->string('postal_code')->nullable();
            $table->string('gstin')->nullable();
            $table->string('pan')->nullable();
            $table->integer('payment_terms_days')->default(30);
            $table->decimal('credit_limit', 15, 2)->default(0);
            $table->enum('rating', ['excellent', 'good', 'average', 'poor'])->default('good');
            $table->enum('status', ['active', 'inactive', 'blacklisted'])->default('active');
            $table->json('certifications')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['organization_id', 'status']);
            $table->index('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
