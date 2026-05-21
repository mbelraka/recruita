-- Applicant master data (mirrors frontend Applicant model; served via /api/applicants).
CREATE TABLE applicants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(512),
    email VARCHAR(512),
    phone VARCHAR(128),
    location VARCHAR(512),
    years_of_experience DOUBLE PRECISION,
    application_status VARCHAR(128),
    current_job_title VARCHAR(512),
    available_from DATE,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applicants_email ON applicants (email);
CREATE INDEX idx_applicants_application_status ON applicants (application_status);
CREATE INDEX idx_applicants_updated_at ON applicants (updated_at DESC);
