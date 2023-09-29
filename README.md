# register

A user register system

######

DATABASE CREATING

######

command for creating the database:

```
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP);
```

the database structure:
+------------+-------------+------+-----+-------------------+-------------------+
| Field | Type | Null | Key | Default | Extra |
+------------+-------------+------+-----+-------------------+-------------------+
| id | int | NO | PRI | NULL | auto_increment |
| first_name | varchar(50) | NO | | NULL | |
| last_name | varchar(50) | NO | | NULL | |
| email | varchar(50) | NO | UNI | NULL | |
| created_at | timestamp | YES | | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| last_login | timestamp | YES | | NULL | |
+------------+-------------+------+-----+-------------------+-------------------+
