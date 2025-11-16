---
layout: post
title: "💾 Continuous Database Deployment"
date: 2025-03-30
categories: [DevOps, Database, CI/CD]
tags: [database deployment, CI/CD, DevOps, migrations, automation]
description: "Implement continuous database deployment for automated, version-controlled schema and data updates in DevOps pipelines."
keywords: [database deployment, DevOps, CI/CD, migrations, automation, continuous deployment]
---

## Continuous Database Deployment

Managing database schema and data changes safely is critical. **Continuous Database Deployment** automates database updates alongside application deployments.

---

### Why Continuous Database Deployment Matters

- **Version Control:** Track database schema changes  
- **Automation:** Reduce manual errors  
- **Rollback:** Revert to previous schema versions safely  
- **Synchronization:** Keep app and database in sync  

---

### Workflow Example

1. Write migration scripts (schema, data)  
2. Store scripts in version control  
3. CI/CD pipeline executes migrations before/after app deployment  
4. Run integration tests to validate changes  
5. Rollback if issues occur  

### Visual Diagram
{% raw %}
<div class="mermaid">
flowchart TD
    A[Migration Scripts] --> B[CI/CD Pipeline]
    B --> C[Apply to Database]
    C --> D[Run Tests]
    D --> E[Deploy Application]
    D --> F[Rollback if Failed]
</div>
{% endraw %}

---

### Full-Fledged Flyway Migration Example

Below is a complete, versioned Flyway migration example with configuration, SQL migrations (forward + optional undo), commands, Docker usage, and a CI snippet.

Files (place these under src/main/resources/db/migration or your Flyway locations):

- V1__create_users_table.sql
```sql
-- V1__create_users_table.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

- V2__add_last_login.sql
```sql
-- V2__add_last_login.sql
ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Backfill recent known values (example)
UPDATE users SET last_login = now() WHERE last_login IS NULL;
```

- V3__seed_demo_user.sql
```sql
-- V3__seed_demo_user.sql
INSERT INTO users (username, email) VALUES ('demo', 'demo@example.com')
ON CONFLICT (username) DO NOTHING;
```

Optional undo (requires Flyway Teams for `undo` support) — names follow Flyway undo convention:
- U2__undo_add_last_login.sql
```sql
-- U2__undo_add_last_login.sql
ALTER TABLE users DROP COLUMN IF EXISTS last_login;
```

Flyway config (flyway.conf) — prefer env vars in CI
```
flyway.url=${DB_URL}
flyway.user=${DB_USER}
flyway.password=${DB_PASSWORD}
# locations=filesystem:src/main/resources/db/migration (adjust for your project)
flyway.locations=classpath:db/migration
```

Local CLI commands (use env vars instead of plain secrets)
```bash
# Validate migrations and show status
flyway -url="$DB_URL" -user="$DB_USER" -password="$DB_PASSWORD" info

# Apply outstanding migrations
flyway -url="$DB_URL" -user="$DB_USER" -password="$DB_PASSWORD" migrate

# Repair metadata (use carefully)
flyway -url="$DB_URL" -user="$DB_USER" -password="$DB_PASSWORD" repair

# Undo last version (Teams)
flyway -url="$DB_URL" -user="$DB_USER" -password="$DB_PASSWORD" undo
```

Docker example (one-off Flyway container)
```yaml
services:
  db:
  image: postgres:15
  environment:
    POSTGRES_USER: app
    POSTGRES_PASSWORD: example
    POSTGRES_DB: appdb
  ports:
    - "5432:5432"

  flyway:
  image: flyway/flyway:9
  depends_on: [db]
  command: -url=jdbc:postgresql://db:5432/appdb -user=app -password=example migrate
  volumes:
    - ./src/main/resources/db/migration:/flyway/sql
```

CI snippet (GitHub Actions) — run migrations during deploy stage
```yaml
name: DB Migrations
on: [push]

jobs:
  migrate:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Set up JDK
    uses: actions/setup-java@v4
    with:
      java-version: '17'
    - name: Run Flyway migrate
    run: |
      curl -L https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.16.0/flyway-commandline-9.16.0-linux-x64.tar.gz | tar xz
      ./flyway-*/flyway -url="${{ secrets.DB_URL }}" -user="${{ secrets.DB_USER }}" -password="${{ secrets.DB_PASSWORD }}" migrate
    env:
      DB_URL: ${{ secrets.DB_URL }}
      DB_USER: ${{ secrets.DB_USER }}
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
```

### summary
- Keep SQL migrations small, idempotent where possible, and versioned (V#__*.sql).  
- Test migrations against a staging DB; run integration tests after migrate.  
- Use environment secrets and never commit credentials.  
- For destructive changes, prefer multi-step changes (add column → backfill → swap reads → drop) to maintain backward compatibility.  
- Consider undo scripts (Flyway Teams) or write explicit rollback SQL stored in version control for emergency rollbacks.

---

### Best Practices

- Version-control all migration scripts
- Test migrations in dev/staging before production
- Automate rollback scripts
- Maintain backward-compatible migrations

---

### Common Pitfalls

- Manual database changes outside pipelines
- Ignoring testing of migrations
- Breaking app compatibility with schema updates

## Conclusion

Continuous database deployment ensures synchronized, safe, and automated database changes, improving reliability and reducing errors in DevOps pipelines.