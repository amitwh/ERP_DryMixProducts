import os
import time
import pymysql
import requests
from datetime import datetime, timedelta
import json

GRAFANA_URL = os.getenv("GRAFANA_URL", "http://general_server_configs:3000")
GRAFANA_USER = os.getenv("GRAFANA_USER", "admin")
GRAFANA_PASSWORD = os.getenv("GRAFANA_PASSWORD", "angles")
DB_HOST = os.getenv("DB_HOST", "general_server_configs")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME", "db_erp_drymix_prod")
DB_USER = os.getenv("DB_USER", "amit")
DB_PASSWORD = os.getenv("DB_PASSWORD", "angles")


class GrafanaConnector:
    def __init__(self):
        self.api_base = f"{GRAFANA_URL}/api"
        self.auth = (GRAFANA_USER, GRAFANA_PASSWORD)
        self.db_connection = None

    def connect_db(self):
        try:
            self.db_connection = pymysql.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                database=DB_NAME,
                cursorclass=pymysql.cursors.DictCursor,
            )
            print(f"Connected to database at {DB_HOST}:{DB_PORT}")
            return True
        except Exception as e:
            print(f"Database connection failed: {e}")
            return False

    def test_connection(self):
        try:
            response = requests.get(
                f"{self.api_base}/health", auth=self.auth, timeout=5
            )
            return response.status_code == 200
        except:
            return False

    def create_datasource(self):
        datasource = {
            "name": "ERP DryMix MySQL",
            "type": "mysql",
            "url": f"{DB_HOST}:{DB_PORT}",
            "access": "proxy",
            "user": DB_USER,
            "database": DB_NAME,
            "secureJsonData": {"password": DB_PASSWORD},
        }

        try:
            response = requests.post(
                f"{self.api_base}/datasources", json=datasource, auth=self.auth
            )
            if response.status_code in [200, 409]:
                print(
                    f"Datasource {'created' if response.status_code == 200 else 'already exists'}"
                )
                return True
            print(f"Datasource creation failed: {response.text}")
            return False
        except Exception as e:
            print(f"Error creating datasource: {e}")
            return False

    def create_dashboard(self, dashboard_data):
        try:
            response = requests.post(
                f"{self.api_base}/dashboards/db", json=dashboard_data, auth=self.auth
            )
            if response.status_code == 200:
                print(
                    f"Dashboard '{dashboard_data['dashboard']['title']}' created successfully"
                )
                return True
            print(f"Dashboard creation failed: {response.text}")
            return False
        except Exception as e:
            print(f"Error creating dashboard: {e}")
            return False

    def get_kpi_data(self, query):
        if not self.db_connection:
            return None

        try:
            with self.db_connection.cursor() as cursor:
                cursor.execute(query)
                result = cursor.fetchone()
                return result
        except Exception as e:
            print(f"Query failed: {e}")
            return None

    def create_organization_dashboard(self):
        dashboard = {
            "dashboard": {
                "id": None,
                "title": "ERP DryMix - Organization Overview",
                "tags": ["erp", "organization"],
                "timezone": "browser",
                "schemaVersion": 36,
                "version": 0,
                "refresh": "30s",
                "panels": [
                    {
                        "id": 1,
                        "title": "Total Organizations",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 6, "x": 0, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT COUNT(*) as value FROM organizations",
                            }
                        ],
                    },
                    {
                        "id": 2,
                        "title": "Total Manufacturing Units",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 6, "x": 6, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT COUNT(*) as value FROM manufacturing_units",
                            }
                        ],
                    },
                    {
                        "id": 3,
                        "title": "Active Users",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT COUNT(*) as value FROM users WHERE is_active = 1",
                            }
                        ],
                    },
                    {
                        "id": 4,
                        "title": "Total Production Orders",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 6, "x": 18, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT COUNT(*) as value FROM production_orders",
                            }
                        ],
                    },
                    {
                        "id": 5,
                        "title": "Organizations by Status",
                        "type": "piechart",
                        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 4},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT is_active, COUNT(*) as count FROM organizations GROUP BY is_active",
                            }
                        ],
                    },
                    {
                        "id": 6,
                        "title": "User Growth",
                        "type": "graph",
                        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 4},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "time_series",
                                "rawSql": "SELECT DATE(created_at) as time, COUNT(*) as value FROM users GROUP BY DATE(created_at) ORDER BY time",
                            }
                        ],
                    },
                ],
            },
            "overwrite": True,
        }

        return self.create_dashboard(dashboard)

    def create_qa_qc_dashboard(self):
        dashboard = {
            "dashboard": {
                "id": None,
                "title": "ERP DryMix - QA/QC Overview",
                "tags": ["erp", "qaqc"],
                "timezone": "browser",
                "schemaVersion": 36,
                "version": 0,
                "refresh": "30s",
                "panels": [
                    {
                        "id": 1,
                        "title": "Total Inspections",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 4, "x": 0, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT COUNT(*) as value FROM inspections",
                            }
                        ],
                    },
                    {
                        "id": 2,
                        "title": "Pass Rate (%)",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 4, "x": 4, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT ROUND((SUM(CASE WHEN test_result = 'pass' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as value FROM inspections",
                            }
                        ],
                    },
                    {
                        "id": 3,
                        "title": "Open NCs",
                        "type": "stat",
                        "gridPos": {"h": 4, "w": 4, "x": 8, "y": 0},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT COUNT(*) as value FROM ncr WHERE status IN ('open', 'investigation', 'action_in_progress')",
                            }
                        ],
                    },
                    {
                        "id": 4,
                        "title": "NCs by Category",
                        "type": "piechart",
                        "gridPos": {"h": 8, "w": 8, "x": 0, "y": 4},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "table",
                                "rawSql": "SELECT nc_category, COUNT(*) as count FROM ncr GROUP BY nc_category",
                            }
                        ],
                    },
                    {
                        "id": 5,
                        "title": "Test Results Trend",
                        "type": "graph",
                        "gridPos": {"h": 8, "w": 8, "x": 8, "y": 4},
                        "targets": [
                            {
                                "datasource": "ERP DryMix MySQL",
                                "format": "time_series",
                                "rawSql": "SELECT test_date as time, COUNT(*) as value FROM inspections GROUP BY test_date ORDER BY test_date",
                            }
                        ],
                    },
                ],
            },
            "overwrite": True,
        }

        return self.create_dashboard(dashboard)


def main():
    print("Starting Grafana Connector for ERP DryMix...")
    connector = GrafanaConnector()

    if not connector.test_connection():
        print("Cannot connect to Grafana. Retrying in 10 seconds...")
        time.sleep(10)
        if not connector.test_connection():
            print("Failed to connect to Grafana. Exiting.")
            return

    print("Connected to Grafana successfully")

    connector.connect_db()

    print("Creating datasource...")
    connector.create_datasource()

    print("Creating dashboards...")
    connector.create_organization_dashboard()
    connector.create_qa_qc_dashboard()

    print("Grafana Connector initialized successfully")
    print("Monitoring for changes...")


if __name__ == "__main__":
    main()
