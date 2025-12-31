<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quality_document_id')->constrained()->onDelete('cascade');
            $table->integer('revision_number');
            $table->string('revision_type')->default('minor'); // minor, major, correction
            $table->text('changes_description');
            $table->foreignId('revised_by')->constrained('users')->onDelete('cascade');
            $table->date('revision_date');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->date('approval_date')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
            
            $table->index(['quality_document_id', 'revision_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_revisions');
    }
};
