\set ON_ERROR_STOP on

-- Run on the dedicated tibon database as tibon_migrator after alembic upgrade head.
BEGIN;
GRANT SELECT, INSERT ON tibon.leads TO tibon_app;
GRANT SELECT, INSERT, UPDATE ON tibon.telegram_notifications TO tibon_app;
COMMIT;
