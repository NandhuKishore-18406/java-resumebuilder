CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) UNIQUE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    url VARCHAR(500),
    linkedin VARCHAR(255),
    github VARCHAR(255),
    leetcode VARCHAR(255),
    bio TEXT,
    techskills TEXT,
    frameworks TEXT,
    databases TEXT,
    tools TEXT,
    softskills TEXT,
    languages TEXT,
    awards TEXT,
    designation VARCHAR(255),
    department VARCHAR(255),
    institution VARCHAR(255),
    vidwan_id VARCHAR(255),
    orcid_id VARCHAR(255),
    education JSONB,
    projects JSONB,
    experience JSONB,
    publications JSONB,
    interests VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    org VARCHAR(255),
    year VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS seminars (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    org VARCHAR(255),
    date VARCHAR(50),
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS files (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    stored_path VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS resume_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    label VARCHAR(255) NOT NULL,
    saved_at VARCHAR(100) NOT NULL,
    resume_data JSONB
);
