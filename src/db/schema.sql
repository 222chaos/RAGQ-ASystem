-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL,
    avatar_url VARCHAR(255),
    type VARCHAR(10) NOT NULL DEFAULT 'student' CHECK (type IN ('student', 'teacher'))
);

-- 创建用户名索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);