#!/bin/bash
# =============================================================================
# ERP DryMix Products - Docker Stop Script
# =============================================================================

echo "============================================="
echo "ERP DryMix Products - Stopping Containers"
echo "============================================="

cd "$(dirname "${BASH_SOURCE[0]}")/.."

docker-compose down

echo ""
echo "All ERP DryMix containers stopped."
echo "Note: Shared cinfo services (MariaDB, Redis, etc.) are still running."
echo ""
