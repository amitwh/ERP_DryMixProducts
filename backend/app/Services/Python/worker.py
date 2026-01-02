import os
import time
import redis
import pymysql
from datetime import datetime
import json
import threading
import logging

REDIS_HOST = os.getenv("REDIS_HOST", "general_server_configs")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "angles")
DB_HOST = os.getenv("DB_HOST", "general_server_configs")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_NAME = os.getenv("DB_NAME", "db_erp_drymix_prod")
DB_USER = os.getenv("DB_USER", "amit")
DB_PASSWORD = os.getenv("DB_PASSWORD", "angles")

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


class ERPWorker:
    def __init__(self):
        self.redis_client = None
        self.db_connection = None
        self.running = False

    def connect_redis(self):
        try:
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
                decode_responses=True,
            )
            self.redis_client.ping()
            logging.info(f"Connected to Redis at {REDIS_HOST}:{REDIS_PORT}")
            return True
        except Exception as e:
            logging.error(f"Redis connection failed: {e}")
            return False

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
            logging.info(f"Connected to database at {DB_HOST}:{DB_PORT}")
            return True
        except Exception as e:
            logging.error(f"Database connection failed: {e}")
            return False

    def process_job(self, job_type, job_data):
        logging.info(f"Processing job: {job_type}")

        try:
            if job_type == "kpi_calculation":
                self.calculate_kpis()
            elif job_type == "email_notification":
                self.send_email_notification(job_data)
            elif job_type == "report_generation":
                self.generate_report(job_data)
            elif job_type == "cache_warmup":
                self.warmup_cache()
            elif job_type == "audit_log":
                self.create_audit_log(job_data)
            else:
                logging.warning(f"Unknown job type: {job_type}")

            return True
        except Exception as e:
            logging.error(f"Job processing failed: {e}")
            return False

    def calculate_kpis(self):
        queries = [
            "INSERT INTO kpi_values (kpi_id, org_id, unit_id, record_date, actual_value, target_value, status, calculated_at) SELECT 1, org_id, NULL, CURDATE(), COUNT(*), NULL, 'on_target', NOW() FROM users WHERE is_active = 1",
            "INSERT INTO kpi_values (kpi_id, org_id, unit_id, record_date, actual_value, target_value, status, calculated_at) SELECT 2, org_id, NULL, CURDATE(), COUNT(*), NULL, 'on_target', NOW() FROM manufacturing_units WHERE is_active = 1",
        ]

        try:
            with self.db_connection.cursor() as cursor:
                for query in queries:
                    cursor.execute(query)
                self.db_connection.commit()
            logging.info("KPIs calculated successfully")
        except Exception as e:
            logging.error(f"KPI calculation failed: {e}")

    def send_email_notification(self, data):
        logging.info(f"Email notification: {data}")

    def generate_report(self, data):
        logging.info(f"Generating report: {data}")

    def warmup_cache(self):
        try:
            cache_keys = [
                "organizations:all",
                "manufacturing_units:all",
                "users:active",
            ]

            with self.db_connection.cursor() as cursor:
                for key in cache_keys:
                    if "organizations" in key:
                        cursor.execute("SELECT * FROM organizations LIMIT 100")
                        data = cursor.fetchall()
                        self.redis_client.setex(key, 3600, json.dumps(data))
                    elif "units" in key:
                        cursor.execute("SELECT * FROM manufacturing_units LIMIT 100")
                        data = cursor.fetchall()
                        self.redis_client.setex(key, 3600, json.dumps(data))
                    elif "users" in key:
                        cursor.execute(
                            "SELECT id, username, email, full_name, role FROM users WHERE is_active = 1 LIMIT 100"
                        )
                        data = cursor.fetchall()
                        self.redis_client.setex(key, 3600, json.dumps(data))

            logging.info("Cache warmed up successfully")
        except Exception as e:
            logging.error(f"Cache warmup failed: {e}")

    def create_audit_log(self, data):
        try:
            with self.db_connection.cursor() as cursor:
                insert_query = """
                INSERT INTO activity_log 
                (org_id, user_id, action, module, record_type, record_id, details, ip_address, user_agent, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
                """
                cursor.execute(
                    insert_query,
                    (
                        data.get("org_id"),
                        data.get("user_id"),
                        data.get("action"),
                        data.get("module"),
                        data.get("record_type"),
                        data.get("record_id"),
                        json.dumps(data.get("details", {})),
                        data.get("ip_address"),
                        data.get("user_agent"),
                    ),
                )
                self.db_connection.commit()
            logging.info(f"Audit log created: {data.get('action')}")
        except Exception as e:
            logging.error(f"Audit log creation failed: {e}")

    def listen_for_jobs(self):
        logging.info("Listening for jobs...")
        self.running = True

        while self.running:
            try:
                job = self.redis_client.brpop("erp_jobs_queue", timeout=30)
                if job:
                    queue_name, job_data = job
                    data = json.loads(job_data)
                    job_type = data.get("job_type", "unknown")
                    self.process_job(job_type, data)
            except Exception as e:
                logging.error(f"Job listening failed: {e}")
                time.sleep(5)

    def schedule_periodic_tasks(self):
        def task_scheduler():
            while self.running:
                try:
                    current_minute = datetime.now().minute

                    if current_minute == 0:
                        logging.info("Running hourly KPI calculation")
                        self.process_job("kpi_calculation", {})

                    if current_minute == 30:
                        logging.info("Running cache warmup")
                        self.process_job("cache_warmup", {})

                    time.sleep(60)
                except Exception as e:
                    logging.error(f"Scheduler failed: {e}")
                    time.sleep(60)

        scheduler_thread = threading.Thread(target=task_scheduler, daemon=True)
        scheduler_thread.start()

    def start(self):
        if not self.connect_redis() or not self.connect_db():
            logging.error("Failed to connect to required services")
            return False

        logging.info("Starting ERP Worker...")
        self.schedule_periodic_tasks()
        self.listen_for_jobs()

        return True

    def stop(self):
        logging.info("Stopping ERP Worker...")
        self.running = False
        if self.redis_client:
            self.redis_client.close()
        if self.db_connection:
            self.db_connection.close()


def main():
    worker = ERPWorker()

    try:
        worker.start()
    except KeyboardInterrupt:
        worker.stop()
        logging.info("Worker stopped")


if __name__ == "__main__":
    main()
