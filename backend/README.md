# death_claims_api

## Database migrations

After cloning the project, install dependencies and run migrations:

```powershell
pip install -r requirements.txt
alembic upgrade head
```

This will create the Alembic version table and apply all schema changes.
