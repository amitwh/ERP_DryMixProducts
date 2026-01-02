<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use App\Models\Invoice;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceiptNote;
use App\Models\ProductionOrder;
use App\Models\Inspection;
use App\Models\Ncr;
use App\Models\CreditControl;
use App\Models\Collection;
use App\Models\Payslip;
use App\Models\DryMixProductTest;
use App\Models\RawMaterialTest;
use App\Models\User;
use App\Models\Organization;
use App\Models\ChartOfAccount;
use App\Models\Ledger;
use App\Models\Product;
use App\Models\Customer;
use App\Models\BillOfMaterial;
use App\Models\ProductionBatch;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class PrintController extends Controller
{
    /**
     * Print Sales Order
     */
    public function salesOrder(SalesOrder $order): Response
    {
        $order->load(['customer', 'items.product', 'manufacturingUnit', 'organization']);

        $data = [
            'title' => 'SALES ORDER',
            'order' => $order,
            'company' => $order->organization,
            'theme' => $this->getPrintTheme($order->organization_id),
        ];

        return $this->generatePDF($data, 'prints.sales-order', "Sales-Order-{$order->order_number}");
    }

    /**
     * Print Invoice
     */
    public function invoice(Invoice $invoice): Response
    {
        $invoice->load(['customer', 'order', 'items', 'organization']);

        $data = [
            'title' => 'TAX INVOICE',
            'invoice' => $invoice,
            'company' => $invoice->organization,
            'theme' => $this->getPrintTheme($invoice->organization_id),
        ];

        return $this->generatePDF($data, 'prints.invoice', "Invoice-{$invoice->invoice_number}");
    }

    /**
     * Print Purchase Order
     */
    public function purchaseOrder(PurchaseOrder $order): Response
    {
        $order->load(['supplier', 'items.product', 'manufacturingUnit', 'organization']);

        $data = [
            'title' => 'PURCHASE ORDER',
            'order' => $order,
            'company' => $order->organization,
            'theme' => $this->getPrintTheme($order->organization_id),
        ];

        return $this->generatePDF($data, 'prints.purchase-order', "Purchase-Order-{$order->order_number}");
    }

    /**
     * Print Goods Receipt Note
     */
    public function goodsReceiptNote(GoodsReceiptNote $grn): Response
    {
        $grn->load(['purchaseOrder.supplier', 'items', 'organization']);

        $data = [
            'title' => 'GOODS RECEIPT NOTE',
            'grn' => $grn,
            'company' => $grn->organization,
            'theme' => $this->getPrintTheme($grn->organization_id),
        ];

        return $this->generatePDF($data, 'prints.grn', "GRN-{$grn->grn_number}");
    }

    /**
     * Print Production Order
     */
    public function productionOrder(ProductionOrder $order): Response
    {
        $order->load(['product', 'batch', 'bom', 'manufacturingUnit', 'organization']);

        $data = [
            'title' => 'PRODUCTION ORDER',
            'order' => $order,
            'company' => $order->organization,
            'theme' => $this->getPrintTheme($order->organization_id),
        ];

        return $this->generatePDF($data, 'prints.production-order', "Production-Order-{$order->order_number}");
    }

    /**
     * Print Bill of Materials
     */
    public function billOfMaterials(Request $request): Response
    {
        $bomId = $request->get('bom_id');
        $bom = BillOfMaterial::with(['product', 'bomItems.rawMaterial', 'organization'])->find($bomId);

        if (!$bom) {
            return response()->json(['message' => 'BOM not found'], 404);
        }

        $data = [
            'title' => 'BILL OF MATERIALS',
            'bom' => $bom,
            'company' => $bom->organization,
            'theme' => $this->getPrintTheme($bom->organization_id),
        ];

        return $this->generatePDF($data, 'prints.bom', "BOM-{$bom->bom_number}");
    }

    /**
     * Print Inspection Report
     */
    public function inspectionReport(Inspection $inspection): Response
    {
        $inspection->load(['product', 'parameters', 'testedBy', 'approvedBy', 'organization']);

        $data = [
            'title' => 'QUALITY INSPECTION REPORT',
            'inspection' => $inspection,
            'company' => $inspection->organization,
            'theme' => $this->getPrintTheme($inspection->organization_id),
        ];

        return $this->generatePDF($data, 'prints.inspection', "Inspection-{$inspection->inspection_number}");
    }

    /**
     * Print NCR Report
     */
    public function ncrReport(Ncr $ncr): Response
    {
        $ncr->load(['product', 'origin', 'verifiedBy', 'approvedBy', 'organization']);

        $data = [
            'title' => 'NON-CONFORMANCE REPORT',
            'ncr' => $ncr,
            'company' => $ncr->organization,
            'theme' => $this->getPrintTheme($ncr->organization_id),
        ];

        return $this->generatePDF($data, 'prints.ncr', "NCR-{$ncr->ncr_number}");
    }

    /**
     * Print Customer Ledger
     */
    public function customerLedger(Request $request): Response
    {
        $customerId = $request->get('customer_id');
        $customer = Customer::with(['organization', 'salesOrders', 'invoices'])->find($customerId);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found'], 404);
        }

        $data = [
            'title' => 'CUSTOMER LEDGER',
            'customer' => $customer,
            'company' => $customer->organization,
            'theme' => $this->getPrintTheme($customer->organization_id),
        ];

        return $this->generatePDF($data, 'prints.customer-ledger', "Customer-Ledger-{$customer->customer_code}");
    }

    /**
     * Print Stock Report
     */
    public function stockReport(Request $request): Response
    {
        $organizationId = $request->get('organization_id');
        $warehouseId = $request->get('warehouse_id');
        $productId = $request->get('product_id');

        $query = \App\Models\Inventory::query()
            ->where('organization_id', $organizationId)
            ->with(['product', 'warehouse', 'organization']);

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($productId) {
            $query->where('product_id', $productId);
        }

        $inventories = $query->get();

        $data = [
            'title' => 'STOCK REPORT',
            'inventories' => $inventories,
            'company' => $inventories->first()?->organization,
            'filters' => [
                'warehouse_id' => $warehouseId,
                'product_id' => $productId,
            ],
            'theme' => $this->getPrintTheme($organizationId),
        ];

        return $this->generatePDF($data, 'prints.stock-report', 'Stock-Report');
    }

    /**
     * Print Credit Control Report
     */
    public function creditControlReport(CreditControl $creditControl): Response
    {
        $creditControl->load(['customer', 'transactions', 'organization']);

        $data = [
            'title' => 'CREDIT CONTROL REPORT',
            'creditControl' => $creditControl,
            'company' => $creditControl->organization,
            'theme' => $this->getPrintTheme($creditControl->organization_id),
        ];

        return $this->generatePDF($data, 'prints.credit-control', "Credit-Control-{$creditControl->customer->customer_code}");
    }

    /**
     * Print Collection Report
     */
    public function collectionReport(Collection $collection): Response
    {
        $collection->load(['customer', 'organization']);

        $data = [
            'title' => 'COLLECTION REPORT',
            'collection' => $collection,
            'company' => $collection->organization,
            'theme' => $this->getPrintTheme($collection->organization_id),
        ];

        return $this->generatePDF($data, 'prints.collection', "Collection-{$collection->collection_number}");
    }

    /**
     * Print Aging Report
     */
    public function agingReport(Request $request): Response
    {
        $organizationId = $request->get('organization_id');
        $asOfDate = $request->get('as_of_date', today());

        $customers = Customer::where('organization_id', $organizationId)
            ->with(['salesOrders' => function($q) use ($asOfDate) {
                $q->where('order_date', '<=', $asOfDate);
            }])
            ->with(['invoices' => function($q) use ($asOfDate) {
                $q->where('invoice_date', '<=', $asOfDate);
            }])
            ->with(['creditControl'])
            ->get();

        $agingData = [];
        foreach ($customers as $customer) {
            $outstanding = $customer->outstanding_balance;
            $agingDays = $customer->creditControl?->aging_days ?? 0;

            $agingData[] = [
                'customer' => $customer,
                'outstanding' => $outstanding,
                'aging_days' => $agingDays,
                'bucket' => $this->getAgingBucket($agingDays),
            ];
        }

        $company = Organization::find($organizationId);

        $data = [
            'title' => 'ACCOUNTS RECEIVABLE AGING REPORT',
            'agingData' => collect($agingData)->sortByDesc('outstanding'),
            'as_of_date' => $asOfDate,
            'company' => $company,
            'theme' => $this->getPrintTheme($organizationId),
        ];

        return $this->generatePDF($data, 'prints.aging-report', 'Aging-Report');
    }

    /**
     * Print Payslip
     */
    public function payslip(Payslip $payslip): Response
    {
        $payslip->load(['employee', 'employee.department', 'employee.designation', 'components', 'components.salaryComponent', 'payrollPeriod', 'organization']);

        $data = [
            'title' => 'PAYSLIP',
            'payslip' => $payslip,
            'company' => $payslip->organization,
            'theme' => $this->getPrintTheme($payslip->organization_id),
        ];

        return $this->generatePDF($data, 'prints.payslip', "Payslip-{$payslip->payslip_number}");
    }

    /**
     * Print Attendance Report
     */
    public function attendanceReport(Request $request): Response
    {
        $organizationId = $request->get('organization_id');
        $employeeId = $request->get('employee_id');
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->endOfMonth()->toDateString());

        $query = \App\Models\Attendance::query()
            ->where('organization_id', $organizationId)
            ->whereBetween('attendance_date', [$startDate, $endDate])
            ->with(['employee', 'employee.department', 'approvedBy']);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $attendances = $query->orderBy('attendance_date')->get();
        $company = Organization::find($organizationId);

        $data = [
            'title' => 'ATTENDANCE REPORT',
            'attendances' => $attendances,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'company' => $company,
            'theme' => $this->getPrintTheme($organizationId),
        ];

        return $this->generatePDF($data, 'prints.attendance-report', 'Attendance-Report');
    }

    /**
     * Print Dry Mix Product Test Report
     */
    public function dryMixProductTest(DryMixProductTest $test): Response
    {
        $test->load(['product', 'batch', 'testedBy', 'verifiedBy', 'approvedBy', 'organization']);

        $data = [
            'title' => 'DRY MIX PRODUCT TEST REPORT',
            'test' => $test,
            'company' => $test->organization,
            'theme' => $this->getPrintTheme($test->organization_id),
        ];

        return $this->generatePDF($data, 'prints.dry-mix-product-test', "Product-Test-{$test->test_number}");
    }

    /**
     * Print Raw Material Test Report
     */
    public function rawMaterialTest(RawMaterialTest $test): Response
    {
        $test->load(['rawMaterial', 'testedBy', 'verifiedBy', 'approvedBy', 'organization']);

        $data = [
            'title' => 'RAW MATERIAL TEST REPORT',
            'test' => $test,
            'company' => $test->organization,
            'theme' => $this->getPrintTheme($test->organization_id),
        ];

        return $this->generatePDF($data, 'prints.raw-material-test', "Material-Test-{$test->test_number}");
    }

    /**
     * Print Trial Balance
     */
    public function trialBalance(Request $request): Response
    {
        $organizationId = $request->get('organization_id');
        $fiscalYearId = $request->get('fiscal_year_id');
        $asOfDate = $request->get('as_of_date', today());

        $accounts = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->with(['childAccounts'])
            ->whereNull('parent_account_id')
            ->get();

        $trialBalance = [];
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($accounts as $account) {
            $balance = Ledger::query()
                ->where('account_id', $account->id)
                ->where('entry_date', '<=', $asOfDate)
                ->sum('debit_amount') - Ledger::query()
                ->where('account_id', $account->id)
                ->where('entry_date', '<=', $asOfDate)
                ->sum('credit_amount');

            $isAssetOrExpense = in_array($account->account_type, ['asset', 'expense']);
            $debit = $isAssetOrExpense ? max(0, $balance) : 0;
            $credit = $isAssetOrExpense ? 0 : max(0, -$balance);

            $trialBalance[] = [
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'debit' => $debit,
                'credit' => $credit,
                'balance' => $balance,
            ];

            $totalDebit += $debit;
            $totalCredit += $credit;
        }

        $company = Organization::find($organizationId);

        $data = [
            'title' => 'TRIAL BALANCE',
            'accounts' => $trialBalance,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'as_of_date' => $asOfDate,
            'company' => $company,
            'theme' => $this->getPrintTheme($organizationId),
        ];

        return $this->generatePDF($data, 'prints.trial-balance', 'Trial-Balance');
    }

    /**
     * Print Balance Sheet
     */
    public function balanceSheet(Request $request): Response
    {
        $organizationId = $request->get('organization_id');
        $asOfDate = $request->get('as_of_date', today());

        $assets = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'asset')
            ->get();

        $liabilities = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'liability')
            ->get();

        $equity = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'equity')
            ->get();

        $company = Organization::find($organizationId);

        $data = [
            'title' => 'BALANCE SHEET',
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $equity,
            'as_of_date' => $asOfDate,
            'company' => $company,
            'theme' => $this->getPrintTheme($organizationId),
        ];

        return $this->generatePDF($data, 'prints.balance-sheet', 'Balance-Sheet');
    }

    /**
     * Print Profit and Loss Statement
     */
    public function profitAndLoss(Request $request): Response
    {
        $organizationId = $request->get('organization_id');
        $startDate = $request->get('start_date', now()->startOfYear()->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $revenue = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'revenue')
            ->get();

        $expenses = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'expense')
            ->get();

        $company = Organization::find($organizationId);

        $data = [
            'title' => 'PROFIT AND LOSS STATEMENT',
            'revenue' => $revenue,
            'expenses' => $expenses,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'company' => $company,
            'theme' => $this->getPrintTheme($organizationId),
        ];

        return $this->generatePDF($data, 'prints.profit-loss', 'Profit-And-Loss');
    }

    /**
     * Generate PDF from view
     */
    protected function generatePDF($data, $view, $filename)
    {
        $pdf = Pdf::loadView($view, $data);

        return $pdf->download("{$filename}.pdf");
    }

    /**
     * Get print theme for organization
     */
    protected function getPrintTheme($organizationId): array
    {
        $organization = Organization::find($organizationId);

        if (!$organization) {
            return $this->getDefaultTheme();
        }

        // In production, this would be fetched from organization settings
        return [
            'primary_color' => '#2563EB', // Blue-600
            'secondary_color' => '#7C3AED', // Violet-600
            'header_background' => '#1E40AF', // Blue-800
            'header_text' => '#FFFFFF',
            'footer_background' => '#F3F4F6', // Gray-100
            'table_header_background' => '#EEF2FF', // Blue-50
            'border_color' => '#E5E7EB', // Gray-200
            'logo' => null,
            'font_family' => 'Arial, sans-serif',
        ];
    }

    /**
     * Get default print theme
     */
    protected function getDefaultTheme(): array
    {
        return [
            'primary_color' => '#2563EB',
            'secondary_color' => '#7C3AED',
            'header_background' => '#1E40AF',
            'header_text' => '#FFFFFF',
            'footer_background' => '#F3F4F6',
            'table_header_background' => '#EEF2FF',
            'border_color' => '#E5E7EB',
            'logo' => null,
            'font_family' => 'Arial, sans-serif',
        ];
    }

    /**
     * Get aging bucket based on days
     */
    protected function getAgingBucket($days): string
    {
        if ($days <= 30) return 'Current';
        if ($days <= 60) return '31-60 Days';
        if ($days <= 90) return '61-90 Days';
        return '90+ Days';
    }
}
