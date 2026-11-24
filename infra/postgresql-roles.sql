\set ON_ERROR_STOP on

-- Bootstrap a new, dedicated database as its provisioning administrator.
CREATE ROLE tibon_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE tibon_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;

CREATE DATABASE tibon OWNER tibon_migrator;
REVOKE ALL ON DATABASE tibon FROM PUBLIC;
GRANT CONNECT ON DATABASE tibon TO tibon_app;

\connect tibon

CREATE SCHEMA tibon AUTHORIZATION tibon_migrator;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA tibon TO tibon_app;
ALTER ROLE tibon_migrator IN DATABASE tibon SET search_path TO tibon;
ALTER ROLE tibon_app IN DATABASE tibon SET search_path TO tibon;
