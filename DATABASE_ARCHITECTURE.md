# Database architecture and SQL

The project uses Firebase (NoSQL), but below is a designed schema for a relational database (PostgreSQL) to demonstrate SQL skills.

## Schema

- **users**: `id` (PK), `email`, `created_at`
- **games**: `id` (PK), `title`, `platform`, `release_year`
- **library**: `user_id` (FK), `game_id` (FK), `status`, `rating`

## Examples of complex queries (SQL Queries)

### 1. Analytics: Average game ratings by platform
```sql
SELECT g.platform, AVG(l.rating) as average_rating
FROM user_library l
JOIN games g ON l.game_id = g.id
GROUP BY g.platform;