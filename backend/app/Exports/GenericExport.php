<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Illuminate\Support\Collection;

class GenericExport implements FromCollection, WithHeadings, WithMapping
{
    protected Collection $data;
    protected array $headers;

    public function __construct(array $data, array $headers)
    {
        $this->data = collect($data);
        $this->headers = $headers;
    }

    public function collection(): Collection
    {
        return $this->data;
    }

    public function headings(): array
    {
        return $this->headers;
    }

    public function map($row): array
    {
        if (is_array($row)) {
            return array_values($row);
        }
        return (array) $row;
    }
}
