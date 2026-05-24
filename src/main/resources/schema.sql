CREATE TABLE IF NOT EXISTS task_events (
    id          BIGSERIAL       PRIMARY KEY,
    task_id     VARCHAR(255)    NOT NULL,
    agent_id    VARCHAR(255),
    event_type  VARCHAR(64)     NOT NULL,
    event_data  TEXT,
    seq         BIGINT          NOT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_events_task_id    ON task_events (task_id);
CREATE INDEX IF NOT EXISTS idx_task_events_seq        ON task_events (seq);
CREATE INDEX IF NOT EXISTS idx_task_events_event_type ON task_events (event_type);

CREATE TABLE IF NOT EXISTS agents (
    id              VARCHAR(255)    PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    type            VARCHAR(64)     NOT NULL,
    status          VARCHAR(32)     NOT NULL DEFAULT 'OFFLINE',
    current_task_id VARCHAR(255),
    started_at      TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents (status);
CREATE INDEX IF NOT EXISTS idx_agents_type   ON agents (type);

CREATE TABLE IF NOT EXISTS tasks (
    id          VARCHAR(255)    PRIMARY KEY,
    agent_id    VARCHAR(255),
    title       VARCHAR(255),
    status      VARCHAR(32)     NOT NULL DEFAULT 'PENDING',
    started_at  TIMESTAMP,
    ended_at    TIMESTAMP,
    duration_ms BIGINT,
    created_at  TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks (agent_id);

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            VARCHAR(64)     NOT NULL DEFAULT 'user',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);
