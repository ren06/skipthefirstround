pg_dump -U admin --no-owner --no-acl --schema-only --create --clean --file=backup.sql daf
REM powershell -Command "(gc backup.sql) -replace 'daf', 'd71kad5c6r40uv' | Out-File backup.sql"
