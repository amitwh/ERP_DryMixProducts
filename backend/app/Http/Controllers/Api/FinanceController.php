<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChartOfAccount;
use App\Models\JournalVoucher;
use App\Models\FiscalYear;
use App\Models\Ledger;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FinanceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Finance & Accounting Module',
                'endpoints' => [
                    '/chart-of-accounts' => 'Chart of Accounts management',
                    '/journal-vouchers' => 'Journal Vouchers',
                    '/fiscal-years' => 'Fiscal Years',
                    '/ledgers' => 'Ledger entries',
                    '/reports' => 'Financial reports',
                ]
            ]
        ]);
    }

    // Chart of Accounts
    public function chartOfAccounts(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $accounts = ChartOfAccount::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['parentAccount', 'childAccounts'])
            ->orderBy('account_code')
            ->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }

    public function storeChartOfAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'account_code' => 'required|string|unique:chart_of_accounts,account_code',
            'account_name' => 'required|string|max:255',
            'account_type' => 'required|in:asset,liability,equity,revenue,expense',
            'sub_type' => 'nullable|string|max:100',
            'parent_account_id' => 'nullable|exists:chart_of_accounts,id',
            'opening_balance' => 'nullable|numeric|min:0',
            'is_cash_account' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        $account = ChartOfAccount::create($validated);
        $account->update(['current_balance' => $account->opening_balance]);

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Chart of account created successfully',
        ], 201);
    }

    // Journal Vouchers
    public function journalVouchers(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $vouchers = JournalVoucher::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with(['fiscalYear', 'journalEntries.account', 'createdBy', 'approvedBy'])
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->when($request->has('voucher_type'), fn($q) => $q->where('voucher_type', $request->voucher_type))
            ->orderBy('voucher_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $vouchers,
        ]);
    }

    public function storeJournalVoucher(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'fiscal_year_id' => 'required|exists:fiscal_years,id',
            'voucher_number' => 'required|string',
            'voucher_date' => 'required|date',
            'voucher_type' => 'required|in:journal,receipt,payment,contra,sales,purchase,debit_note,credit_note',
            'reference' => 'nullable|string|max:255',
            'narration' => 'nullable|string',
            'entries' => 'required|array|min:2',
            'entries.*.account_id' => 'required|exists:chart_of_accounts,id',
            'entries.*.entry_type' => 'required|in:debit,credit',
            'entries.*.amount' => 'required|numeric|min:0',
            'entries.*.description' => 'nullable|string',
        ]);

        // Check debit-credit balance
        $totalDebit = 0;
        $totalCredit = 0;
        foreach ($validated['entries'] as $entry) {
            if ($entry['entry_type'] === 'debit') {
                $totalDebit += $entry['amount'];
            } else {
                $totalCredit += $entry['amount'];
            }
        }

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return response()->json([
                'success' => false,
                'message' => 'Debit and Credit amounts must be equal',
                'data' => [
                    'total_debit' => $totalDebit,
                    'total_credit' => $totalCredit,
                ]
            ], 422);
        }

        $voucher = JournalVoucher::create([
            'organization_id' => $validated['organization_id'],
            'fiscal_year_id' => $validated['fiscal_year_id'],
            'voucher_number' => $validated['voucher_number'],
            'voucher_date' => $validated['voucher_date'],
            'voucher_type' => $validated['voucher_type'],
            'reference' => $validated['reference'] ?? null,
            'narration' => $validated['narration'] ?? null,
            'total_debit' => $totalDebit,
            'total_credit' => $totalCredit,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        // Create journal entries
        foreach ($validated['entries'] as $entry) {
            $voucher->journalEntries()->create($entry);
        }

        return response()->json([
            'success' => true,
            'data' => $voucher->load('journalEntries'),
            'message' => 'Journal voucher created successfully',
        ], 201);
    }

    public function postJournalVoucher(JournalVoucher $voucher): JsonResponse
    {
        if ($voucher->status === 'posted') {
            return response()->json([
                'success' => false,
                'message' => 'Voucher already posted',
            ], 400);
        }

        $voucher->post();

        return response()->json([
            'success' => true,
            'message' => 'Journal voucher posted successfully',
        ]);
    }

    public function cancelJournalVoucher(JournalVoucher $voucher): JsonResponse
    {
        if ($voucher->status !== 'posted') {
            return response()->json([
                'success' => false,
                'message' => 'Only posted vouchers can be cancelled',
            ], 400);
        }

        $voucher->cancel();

        return response()->json([
            'success' => true,
            'message' => 'Journal voucher cancelled successfully',
        ]);
    }

    // Fiscal Years
    public function fiscalYears(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');

        $years = FiscalYear::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->orderBy('start_date', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $years,
        ]);
    }

    public function storeFiscalYear(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'nullable|in:upcoming,current,closed',
        ]);

        $year = FiscalYear::create(array_merge($validated, [
            'is_locked' => false,
            'created_by' => auth()->id(),
        ]));

        return response()->json([
            'success' => true,
            'data' => $year,
            'message' => 'Fiscal year created successfully',
        ], 201);
    }

    // Ledgers
    public function ledgers(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $accountId = $request->get('account_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        $query = Ledger::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->when($accountId, fn($q) => $q->where('account_id', $accountId))
            ->with(['account', 'journalEntry'])
            ->orderBy('entry_date', 'desc');

        if ($startDate && $endDate) {
            $query->whereBetween('entry_date', [$startDate, $endDate]);
        }

        $ledgers = $query->paginate($request->get('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $ledgers,
        ]);
    }

    // Reports
    public function trialBalance(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $fiscalYearId = $request->get('fiscal_year_id');
        $asOfDate = $request->get('as_of_date', today());

        $accounts = ChartOfAccount::query()
            ->when($organizationId, fn($q) => $q->where('organization_id', $organizationId))
            ->with('childAccounts')
            ->whereNull('parent_account_id')
            ->get();

        $trialBalance = [];
        $totalDebit = 0;
        $totalCredit = 0;

        foreach ($accounts as $account) {
            $balance = $this->getAccountBalance($account, $fiscalYearId, $asOfDate);
            $trialBalance[] = [
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'debit' => $balance['debit'],
                'credit' => $balance['credit'],
                'net_balance' => $balance['net'],
            ];
            $totalDebit += $balance['debit'];
            $totalCredit += $balance['credit'];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'accounts' => $trialBalance,
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'is_balanced' => abs($totalDebit - $totalCredit) < 0.01,
            ],
        ]);
    }

    public function balanceSheet(Request $request): JsonResponse
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

        return response()->json([
            'success' => true,
            'data' => [
                'assets' => $this->calculateAccountBalances($assets),
                'liabilities' => $this->calculateAccountBalances($liabilities),
                'equity' => $this->calculateAccountBalances($equity),
                'as_of_date' => $asOfDate,
            ],
        ]);
    }

    public function profitAndLoss(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', today()->toDateString());

        $revenue = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'revenue')
            ->get();

        $expenses = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->where('account_type', 'expense')
            ->get();

        $totalRevenue = 0;
        foreach ($revenue as $account) {
            $totalRevenue += $account->current_balance;
        }

        $totalExpense = 0;
        foreach ($expenses as $account) {
            $totalExpense += $account->current_balance;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => $this->calculateAccountBalances($revenue),
                'expenses' => $this->calculateAccountBalances($expenses),
                'total_revenue' => $totalRevenue,
                'total_expenses' => $totalExpense,
                'net_profit' => $totalRevenue - $totalExpense,
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
            ],
        ]);
    }

    private function getAccountBalance($account, $fiscalYearId, $asOfDate)
    {
        $debit = 0;
        $credit = 0;

        $ledgers = Ledger::query()
            ->where('account_id', $account->id)
            ->where('entry_date', '<=', $asOfDate)
            ->when($fiscalYearId, fn($q) => $q->whereHas('journalVoucher', fn($q) => $q->where('fiscal_year_id', $fiscalYearId)))
            ->get();

        foreach ($ledgers as $ledger) {
            $debit += $ledger->debit_amount;
            $credit += $ledger->credit_amount;
        }

        $isAssetOrExpense = in_array($account->account_type, ['asset', 'expense']);
        $net = $isAssetOrExpense ? ($debit - $credit) : ($credit - $debit);

        return [
            'debit' => $isAssetOrExpense ? max(0, $net) : $debit,
            'credit' => $isAssetOrExpense ? $credit : max(0, $net),
            'net' => $net,
        ];
    }

    private function calculateAccountBalances($accounts)
    {
        $result = [];
        foreach ($accounts as $account) {
            $result[] = [
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'balance' => $account->current_balance,
            ];
        }
        return $result;
    }

    public function accountBalance(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $accountId = $request->get('account_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date', today()->toDateString());

        if (!$accountId) {
            return response()->json([
                'success' => false,
                'message' => 'Account ID is required',
            ], 422);
        }

        $account = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($accountId);

        $query = Ledger::query()
            ->where('account_id', $accountId)
            ->orderBy('entry_date');

        if ($startDate) {
            $query->where('entry_date', '>=', $startDate);
        }

        $ledgers = $query->where('entry_date', '<=', $endDate)->get();

        $totalDebit = $ledgers->sum('debit_amount');
        $totalCredit = $ledgers->sum('credit_amount');

        $isAssetOrExpense = in_array($account->account_type, ['asset', 'expense']);
        $currentBalance = $isAssetOrExpense ? ($totalDebit - $totalCredit) : ($totalCredit - $totalDebit);

        return response()->json([
            'success' => true,
            'data' => [
                'account' => [
                    'id' => $account->id,
                    'code' => $account->account_code,
                    'name' => $account->account_name,
                    'type' => $account->account_type,
                ],
                'opening_balance' => $account->opening_balance,
                'current_balance' => $account->current_balance,
                'period_debit' => $totalDebit,
                'period_credit' => $totalCredit,
                'net_balance' => $currentBalance,
                'balance_type' => $currentBalance >= 0 ? 'debit' : 'credit',
                'transaction_count' => $ledgers->count(),
            ],
        ]);
    }

    public function runningBalance(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $accountId = $request->get('account_id');
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date', today()->toDateString());

        if (!$accountId) {
            return response()->json([
                'success' => false,
                'message' => 'Account ID is required',
            ], 422);
        }

        $account = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($accountId);

        $query = Ledger::query()
            ->where('account_id', $accountId)
            ->orderBy('entry_date', 'asc')
            ->orderBy('id', 'asc');

        if ($startDate) {
            $query->where('entry_date', '>=', $startDate);
        }

        $ledgers = $query->where('entry_date', '<=', $endDate)->get();

        $runningBalance = $account->opening_balance;
        $transactions = [];

        foreach ($ledgers as $ledger) {
            $isAssetOrExpense = in_array($account->account_type, ['asset', 'expense']);

            if ($ledger->entry_type === 'debit') {
                $runningBalance = $isAssetOrExpense ? $runningBalance + $ledger->debit_amount : $runningBalance - $ledger->debit_amount;
            } else {
                $runningBalance = $isAssetOrExpense ? $runningBalance - $ledger->credit_amount : $runningBalance + $ledger->credit_amount;
            }

            $transactions[] = [
                'date' => $ledger->entry_date->format('Y-m-d'),
                'reference' => $ledger->reference,
                'entry_type' => $ledger->entry_type,
                'debit' => $ledger->debit_amount,
                'credit' => $ledger->credit_amount,
                'balance' => $runningBalance,
                'narration' => $ledger->narration,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'account' => [
                    'id' => $account->id,
                    'code' => $account->account_code,
                    'name' => $account->account_name,
                    'type' => $account->account_type,
                ],
                'opening_balance' => $account->opening_balance,
                'closing_balance' => $runningBalance,
                'transactions' => $transactions,
            ],
        ]);
    }

    public function reconcileBalance(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $accountId = $request->get('account_id');
        $reconciledDate = $request->get('reconciled_date', today()->toDateString());
        $statementBalance = $request->get('statement_balance');
        $statementDate = $request->get('statement_date', today()->toDateString());

        if (!$accountId || !$statementBalance) {
            return response()->json([
                'success' => false,
                'message' => 'Account ID and statement balance are required',
            ], 422);
        }

        $account = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($accountId);

        $bookBalance = $account->current_balance;
        $difference = $statementBalance - $bookBalance;

        $outstandingTransactions = Ledger::query()
            ->where('account_id', $accountId)
            ->where('entry_date', '<=', $statementDate)
            ->orderBy('entry_date', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'account' => [
                    'id' => $account->id,
                    'code' => $account->account_code,
                    'name' => $account->account_name,
                ],
                'book_balance' => $bookBalance,
                'statement_balance' => $statementBalance,
                'statement_date' => $statementDate,
                'difference' => $difference,
                'is_reconciled' => abs($difference) < 0.01,
                'reconciled_date' => abs($difference) < 0.01 ? $reconciledDate : null,
                'outstanding_transactions' => $outstandingTransactions,
                'recommendations' => $difference != 0 ? $this->getReconciliationRecommendations($difference, $account->account_type) : [],
            ],
        ]);
    }

    public function balanceSummary(Request $request): JsonResponse
    {
        $organizationId = $request->get('organization_id');
        $asOfDate = $request->get('as_of_date', today()->toDateString());

        $accounts = ChartOfAccount::query()
            ->where('organization_id', $organizationId)
            ->get();

        $summary = [
            'assets' => ['total' => 0, 'accounts' => []],
            'liabilities' => ['total' => 0, 'accounts' => []],
            'equity' => ['total' => 0, 'accounts' => []],
            'revenue' => ['total' => 0, 'accounts' => []],
            'expenses' => ['total' => 0, 'accounts' => []],
        ];

        foreach ($accounts as $account) {
            $balance = $account->current_balance;
            $type = $account->account_type;

            if (isset($summary[$type])) {
                $summary[$type]['total'] += $balance;
                $summary[$type]['accounts'][] = [
                    'code' => $account->account_code,
                    'name' => $account->account_name,
                    'balance' => $balance,
                ];
            }
        }

        $totalAssets = $summary['assets']['total'];
        $totalLiabilities = $summary['liabilities']['total'];
        $totalEquity = $summary['equity']['total'];
        $totalRevenue = $summary['revenue']['total'];
        $totalExpenses = $summary['expenses']['total'];
        $netIncome = $totalRevenue - $totalExpenses;

        $totalLiabilitiesAndEquity = $totalLiabilities + $totalEquity + $netIncome;
        $balanceCheck = $totalAssets - $totalLiabilitiesAndEquity;

        return response()->json([
            'success' => true,
            'data' => [
                'summary' => $summary,
                'totals' => [
                    'total_assets' => $totalAssets,
                    'total_liabilities' => $totalLiabilities,
                    'total_equity' => $totalEquity,
                    'total_revenue' => $totalRevenue,
                    'total_expenses' => $totalExpenses,
                    'net_income' => $netIncome,
                    'total_liabilities_and_equity' => $totalLiabilitiesAndEquity,
                ],
                'as_of_date' => $asOfDate,
                'is_balanced' => abs($balanceCheck) < 0.01,
                'balance_difference' => $balanceCheck,
            ],
        ]);
    }

    public function updateAccountBalance(Request $request, ChartOfAccount $account): JsonResponse
    {
        $validated = $request->validate([
            'opening_balance' => 'required|numeric',
            'reason' => 'required|string',
        ]);

        $oldBalance = $account->current_balance;
        $difference = $validated['opening_balance'] - $account->opening_balance;

        $account->update([
            'opening_balance' => $validated['opening_balance'],
            'current_balance' => $validated['opening_balance'] + $difference,
        ]);

        Ledger::create([
            'organization_id' => $account->organization_id,
            'account_id' => $account->id,
            'entry_date' => today(),
            'reference' => 'ADJ-' . date('YmdHis'),
            'entry_type' => $difference >= 0 ? 'debit' : 'credit',
            'debit_amount' => $difference >= 0 ? abs($difference) : 0,
            'credit_amount' => $difference < 0 ? abs($difference) : 0,
            'balance' => $account->current_balance,
            'narration' => 'Balance adjustment: ' . $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Account balance updated successfully',
        ]);
    }

    private function getReconciliationRecommendations($difference, $accountType): array
    {
        $recommendations = [];

        if (abs($difference) > 100) {
            $recommendations[] = 'Large difference detected. Check for unposted transactions.';
        }

        if ($accountType === 'asset' || $accountType === 'liability') {
            $recommendations[] = 'Review bank statements and outstanding checks.';
            $recommendations[] = 'Check for deposits in transit.';
        }

        if ($difference > 0 && $accountType === 'asset') {
            $recommendations[] = 'Book balance is higher than statement. Possible unrecorded withdrawals.';
        } elseif ($difference < 0 && $accountType === 'asset') {
            $recommendations[] = 'Statement balance is higher than book. Possible unrecorded deposits.';
        }

        return $recommendations;
    }
}
