<?php

namespace App\Services;

class PredictionService
{
    public function forecastDemand(array $historicalData, int $months): array
    {
        if (empty($historicalData)) {
            return $this->generateDefaultForecast($months);
        }

        $values = array_column($historicalData, 'total');
        $forecast = [];
        $lastValue = end($values);
        $trend = $this->calculateTrend($values);
        $seasonality = $this->detectSeasonality($values);

        for ($i = 1; $i <= $months; $i++) {
            $baseValue = $lastValue * (1 + ($trend / 100));
            $seasonalFactor = $seasonality[count($values) % 12] ?? 1;
            $forecast[] = [
                'period' => $this->getFuturePeriod($i),
                'predicted_value' => max(0, $baseValue * $seasonalFactor),
                'trend_component' => $trend,
                'seasonal_component' => $seasonalFactor,
            ];
            $lastValue = $baseValue;
        }

        return $forecast;
    }

    public function predictProduction(array $historicalData, int $days): array
    {
        if (empty($historicalData)) {
            return $this->generateDefaultProductionForecast($days);
        }

        $quantities = array_column($historicalData, 'total_quantity');
        $avgProduction = !empty($quantities) ? array_sum($quantities) / count($quantities) : 100;
        $trend = $this->calculateTrend($quantities);

        $prediction = [];
        for ($i = 1; $i <= $days; $i++) {
            $predictedQty = $avgProduction * (1 + ($trend / 100) * ($i / 30));
            $prediction[] = [
                'date' => now()->addDays($i)->format('Y-m-d'),
                'predicted_quantity' => max(0, round($predictedQty)),
                'confidence' => max(50, 100 - ($i * 2)),
            ];
        }

        return $prediction;
    }

    public function predictQuality(array $qualityData): array
    {
        if (empty($qualityData)) {
            return [
                'predicted_defect_rate' => 0,
                'risk_level' => 'low',
                'recommendations' => ['Collect more quality data for accurate predictions'],
            ];
        }

        $totalInspections = array_sum(array_column($qualityData, 'total_inspections'));
        $totalFailed = array_sum(array_column($qualityData, 'failed'));

        $defectRate = $totalInspections > 0 ? ($totalFailed / $totalInspections) * 100 : 0;

        $riskLevel = $this->assessQualityRisk($defectRate);
        $recommendations = $this->getQualityRecommendations($defectRate, $qualityData);

        return [
            'predicted_defect_rate' => round($defectRate, 2),
            'risk_level' => $riskLevel,
            'recommendations' => $recommendations,
            'quality_score' => max(0, 100 - ($defectRate * 2)),
        ];
    }

    public function analyzeTrend(array $values): array
    {
        if (count($values) < 2) {
            return ['direction' => 'stable', 'percentage' => 0, 'confidence' => 0];
        }

        $firstHalf = array_slice($values, 0, floor(count($values) / 2));
        $secondHalf = array_slice($values, floor(count($values) / 2));

        $firstAvg = array_sum($firstHalf) / count($firstHalf);
        $secondAvg = array_sum($secondHalf) / count($secondHalf);

        if ($firstAvg == 0) {
            return ['direction' => 'stable', 'percentage' => 0, 'confidence' => 50];
        }

        $change = (($secondAvg - $firstAvg) / $firstAvg) * 100;

        return [
            'direction' => $change > 5 ? 'increasing' : ($change < -5 ? 'decreasing' : 'stable'),
            'percentage' => round($change, 2),
            'confidence' => min(100, max(50, 100 - abs($change))),
        ];
    }

    public function detectSeasonality(array $values): array
    {
        $seasonality = [];
        for ($i = 0; $i < 12; $i++) {
            $monthValues = [];
            for ($j = $i; $j < count($values); $j += 12) {
                $monthValues[] = $values[$j];
            }
            $seasonality[$i] = !empty($monthValues) ? array_sum($monthValues) / count($monthValues) : 1;
        }

        $overallAvg = !empty($values) ? array_sum($values) / count($values) : 1;
        if ($overallAvg > 0) {
            foreach ($seasonality as $key => $value) {
                $seasonality[$key] = $value / $overallAvg;
            }
        }

        return $seasonality;
    }

    private function calculateTrend(array $values): float
    {
        if (count($values) < 2) {
            return 0;
        }

        $n = count($values);
        $sumX = 0;
        $sumY = 0;
        $sumXY = 0;
        $sumX2 = 0;

        for ($i = 0; $i < $n; $i++) {
            $sumX += $i;
            $sumY += $values[$i];
            $sumXY += ($i * $values[$i]);
            $sumX2 += ($i * $i);
        }

        $denominator = ($n * $sumX2) - ($sumX * $sumX);
        if ($denominator == 0) {
            return 0;
        }

        $slope = (($n * $sumXY) - ($sumX * $sumY)) / $denominator;
        $avgY = $sumY / $n;

        if ($avgY == 0) {
            return 0;
        }

        return ($slope / $avgY) * 100;
    }

    private function generateDefaultForecast(int $months): array
    {
        $forecast = [];
        for ($i = 1; $i <= $months; $i++) {
            $forecast[] = [
                'period' => $this->getFuturePeriod($i),
                'predicted_value' => 0,
                'confidence' => 0,
            ];
        }
        return $forecast;
    }

    private function generateDefaultProductionForecast(int $days): array
    {
        $prediction = [];
        for ($i = 1; $i <= $days; $i++) {
            $prediction[] = [
                'date' => now()->addDays($i)->format('Y-m-d'),
                'predicted_quantity' => 0,
                'confidence' => 0,
            ];
        }
        return $prediction;
    }

    private function getFuturePeriod(int $monthsAhead): string
    {
        return now()->addMonths($monthsAhead)->format('Y-m');
    }

    private function assessQualityRisk(float $defectRate): string
    {
        if ($defectRate >= 10) {
            return 'critical';
        } elseif ($defectRate >= 5) {
            return 'high';
        } elseif ($defectRate >= 2) {
            return 'medium';
        }
        return 'low';
    }

    private function getQualityRecommendations(float $defectRate, array $data): array
    {
        $recommendations = [];

        if ($defectRate > 5) {
            $recommendations[] = 'Review and enhance quality control processes';
            $recommendations[] = 'Investigate root causes of common defects';
            $recommendations[] = 'Consider additional staff training';
        }

        if ($defectRate > 2) {
            $recommendations[] = 'Increase inspection frequency';
            $recommendations[] = 'Review supplier quality';
        }

        if (empty($recommendations)) {
            $recommendations[] = 'Continue monitoring quality metrics';
            $recommendations[] = 'Document best practices for knowledge sharing';
        }

        return $recommendations;
    }
}
