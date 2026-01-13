<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Employees
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('manufacturing_unit_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('employee_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('country')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('national_id')->nullable();
            $table->string('tax_id')->nullable();
            $table->foreignId('department_id')->nullable();
            $table->foreignId('designation_id')->nullable();
            $table->foreignId('grade_id')->nullable();
            $table->date('join_date');
            $table->date('confirmation_date')->nullable();
            $table->enum('employment_type', ['permanent', 'contract', 'probation', 'intern'])->default('permanent');
            $table->enum('status', ['active', 'inactive', 'on_leave', 'resigned', 'terminated'])->default('active');
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_ifsc_code')->nullable();
            $table->text('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organization_id', 'employee_code']);
            $table->index(['organization_id', 'status']);
        });

        // Departments
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->string('department_code')->unique();
            $table->string('department_name');
            $table->text('description')->nullable();
            $table->foreignId('department_head_id')->nullable()->constrained('employees')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['organization_id', 'department_code']);
        });

        // Designations
        Schema::create('designations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('designation_code')->unique();
            $table->string('designation_name');
            $table->text('description')->nullable();
            $table->integer('grade_level')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['organization_id', 'designation_code']);
        });

        // Grades/Salary Bands
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('grade_code')->unique();
            $table->string('grade_name');
            $table->decimal('min_salary', 15, 2)->default(0);
            $table->decimal('max_salary', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['organization_id', 'grade_code']);
        });

        // Attendance
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('attendance_date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->time('break_start')->nullable();
            $table->time('break_end')->nullable();
            $table->decimal('working_hours', 5, 2)->default(0);
            $table->enum('status', ['present', 'absent', 'half_day', 'late', 'leave', 'holiday'])->default('present');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->text('remarks')->nullable();
            $table->foreignId('approved_by')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'employee_id', 'attendance_date']);
            $table->index(['organization_id', 'attendance_date']);
        });

        // Leave Types
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('leave_code')->unique();
            $table->string('leave_name');
            $table->boolean('is_paid')->default(true);
            $table->integer('days_allowed')->default(0);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('can_carry_forward')->default(false);
            $table->integer('max_carry_forward_days')->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['organization_id', 'leave_code']);
        });

        // Leave Requests
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained()->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('total_days', 5, 2)->default(0);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->date('applied_date');
            $table->foreignId('approved_by')->nullable();
            $table->date('approved_date')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'employee_id', 'status'], 'leave_req_org_emp_stat_idx');
            $table->index(['organization_id', 'start_date']);
        });

        // Payroll Periods
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('fiscal_year_id')->nullable()->constrained()->onDelete('set null');
            $table->string('period_name');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('payment_date');
            $table->enum('status', ['draft', 'processing', 'completed'])->default('draft');
            $table->boolean('is_locked')->default(false);
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'start_date']);
            $table->index('status');
        });

        // Payslips
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('payroll_period_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('payslip_number')->unique();
            $table->decimal('basic_salary', 15, 2)->default(0);
            $table->decimal('gross_salary', 15, 2)->default(0);
            $table->decimal('total_deductions', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2)->default(0);
            $table->integer('working_days')->default(0);
            $table->integer('paid_days')->default(0);
            $table->integer('leave_days')->default(0);
            $table->enum('status', ['draft', 'finalized', 'paid'])->default('draft');
            $table->foreignId('created_by')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'employee_id', 'payroll_period_id'], 'payslips_org_emp_period_idx');
        });

        // Salary Components
        Schema::create('salary_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('component_code')->unique();
            $table->string('component_name');
            $table->enum('component_type', ['earning', 'deduction']);
            $table->enum('calculation_type', ['fixed', 'percentage', 'formula']);
            $table->decimal('value', 15, 2)->default(0);
            $table->integer('percentage_of')->nullable();
            $table->boolean('is_taxable')->default(false);
            $table->boolean('is_pf_eligible')->default(false);
            $table->boolean('is_esi_eligible')->default(false);
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['organization_id', 'component_code']);
        });

        // Payslip Components
        Schema::create('payslip_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payslip_id')->constrained()->onDelete('cascade');
            $table->foreignId('salary_component_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('calculated_amount', 15, 2)->default(0);
            $table->timestamps();

            $table->index(['payslip_id', 'salary_component_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslip_components');
        Schema::dropIfExists('salary_components');
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_periods');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_types');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('designations');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('employees');
    }
};
