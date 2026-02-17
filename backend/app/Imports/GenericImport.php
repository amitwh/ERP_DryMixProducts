<?php

namespace App\Imports;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Validator;

class GenericImport implements ToCollection, WithHeadingRow
{
    protected string $type;
    protected ?int $organizationId;
    protected int $importedCount = 0;
    protected int $skippedCount = 0;
    protected array $errors = [];

    public function __construct(string $type, ?int $organizationId = null)
    {
        $this->type = $type;
        $this->organizationId = $organizationId;
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            try {
                $this->processRow($row);
                $this->importedCount++;
            } catch (\Exception $e) {
                $this->skippedCount++;
                $this->errors[] = [
                    'row' => $index + 2,
                    'error' => $e->getMessage(),
                ];
            }
        }
    }

    protected function processRow(Collection $row): void
    {
        switch ($this->type) {
            case 'customers':
                $this->importCustomer($row);
                break;
            case 'products':
                $this->importProduct($row);
                break;
            case 'suppliers':
                $this->importSupplier($row);
                break;
        }
    }

    protected function importCustomer(Collection $row): void
    {
        $validator = Validator::make($row->toArray(), [
            'customer_code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email',
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        Customer::updateOrCreate(
            [
                'organization_id' => $this->organizationId,
                'customer_code' => $row['customer_code'],
            ],
            [
                'name' => $row['name'],
                'email' => $row['email'] ?? null,
                'phone' => $row['phone'] ?? null,
                'address' => $row['address'] ?? null,
                'city' => $row['city'] ?? null,
                'state' => $row['state'] ?? null,
                'country' => $row['country'] ?? null,
                'postal_code' => $row['postal_code'] ?? null,
                'gst_number' => $row['gst_number'] ?? null,
                'credit_limit' => $row['credit_limit'] ?? 0,
                'payment_terms' => $row['payment_terms'] ?? 'Net 30',
                'status' => 'active',
            ]
        );
    }

    protected function importProduct(Collection $row): void
    {
        $validator = Validator::make($row->toArray(), [
            'product_code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        Product::updateOrCreate(
            [
                'organization_id' => $this->organizationId,
                'product_code' => $row['product_code'],
            ],
            [
                'name' => $row['name'],
                'description' => $row['description'] ?? null,
                'product_type' => $row['product_type'] ?? 'general',
                'unit_of_measure' => $row['unit_of_measure'] ?? 'kg',
                'selling_price' => $row['selling_price'] ?? 0,
                'cost_price' => $row['cost_price'] ?? 0,
                'minimum_stock' => $row['minimum_stock'] ?? 0,
                'maximum_stock' => $row['maximum_stock'] ?? 0,
                'status' => 'active',
            ]
        );
    }

    protected function importSupplier(Collection $row): void
    {
        $validator = Validator::make($row->toArray(), [
            'supplier_code' => 'required|string|max:50',
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        Supplier::updateOrCreate(
            [
                'organization_id' => $this->organizationId,
                'supplier_code' => $row['supplier_code'],
            ],
            [
                'name' => $row['name'],
                'email' => $row['email'] ?? null,
                'phone' => $row['phone'] ?? null,
                'address' => $row['address'] ?? null,
                'city' => $row['city'] ?? null,
                'state' => $row['state'] ?? null,
                'country' => $row['country'] ?? null,
                'postal_code' => $row['postal_code'] ?? null,
                'gst_number' => $row['gst_number'] ?? null,
                'contact_person' => $row['contact_person'] ?? null,
                'payment_terms' => $row['payment_terms'] ?? 'Net 30',
                'status' => 'active',
            ]
        );
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
