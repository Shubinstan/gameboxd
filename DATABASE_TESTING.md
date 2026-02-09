# Database Architecture & SQL Simulation

This project uses Google Firebase (NoSQL) for flexibility and speed of development. However, to demonstrate skills in working with relational DBMS (PostgreSQL/MySQL), below is a diagram of how the data would look in SQL, along with examples of analytical queries.

## 1. Relational Schema

**Table: users**
- id (UUID, PK) - Unique user ID
- email (VARCHAR) - Email
- created_at (TIMESTAMP) - Registration date

**Table: games**
- id (UUID, PK) - Game ID (IGDB ID)
- title (VARCHAR) - Title
- platform (VARCHAR) - Platform (PC, PS5, etc.)
- release_year (INT) - Release year

**Table: user_library**
- user_id (FK -> users.id)
- game_id (FK -> games.id)
- status (ENUM: 'PLAYING', 'COMPLETED', 'BACKLOG')
- rating (FLOAT) - User rating
- user_review (TEXT) - Text review

## 2. SQL Skills

### Analysis: Average game ratings by platform
This query allows you to find out which platform users rate the highest.

```sql
SELECT g.platform, AVG(l.rating) as average_rating
FROM user_library l
JOIN games g ON l.game_id = g.id
GROUP BY g.platform;