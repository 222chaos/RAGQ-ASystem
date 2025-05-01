-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    avatar_url text,
    type VARCHAR(10) NOT NULL DEFAULT 'student' CHECK (type IN ('student', 'teacher'))
);

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    teacher_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(50) NOT NULL,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    class_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100)
);

-- 创建用户名索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 创建学生表索引
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

-- 创建练习表
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    teacher_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('简单', '中等', '困难')),
    status VARCHAR(10) NOT NULL DEFAULT '草稿' CHECK (status IN ('草稿', '已发布')),
    deadline TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

-- 创建练习表索引
CREATE INDEX IF NOT EXISTS idx_exercises_teacher_id ON exercises(teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_status ON exercises(status);