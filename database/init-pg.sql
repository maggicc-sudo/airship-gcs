-- ============================================================
-- 临近空间飞艇智能飞行决策系统 - 数据库初始化脚本
-- PostgreSQL 15
-- ============================================================

-- 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- 飞艇表
-- ============================================================
CREATE TABLE airship (
    id          VARCHAR(32) PRIMARY KEY DEFAULT 'AS-' || LPAD(NEXTVAL('airship_seq')::TEXT, 3, '0'),
    name        VARCHAR(64) NOT NULL,
    type        VARCHAR(32),
    tech_system VARCHAR(16),
    length      DECIMAL(8,2),
    diameter    DECIMAL(8,2),
    volume      DECIMAL(10,2),
    max_altitude DECIMAL(8,2),
    max_speed   DECIMAL(6,2),
    max_payload DECIMAL(8,2),
    status      VARCHAR(16) DEFAULT 'maintenance',
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE airship_seq START 1;

-- ============================================================
-- 控制指令日志
-- ============================================================
CREATE TABLE command_log (
    id            BIGSERIAL PRIMARY KEY,
    airship_id    VARCHAR(32) NOT NULL REFERENCES airship(id),
    command_type  VARCHAR(32) NOT NULL,
    command_params JSONB,
    operator_id   VARCHAR(32),
    status        VARCHAR(16) DEFAULT 'sent',
    sent_at       TIMESTAMP DEFAULT NOW(),
    confirmed_at  TIMESTAMP,
    completed_at  TIMESTAMP
);

-- ============================================================
-- 航线
-- ============================================================
CREATE TABLE route (
    id          VARCHAR(32) PRIMARY KEY DEFAULT 'RTE-' || LPAD(NEXTVAL('route_seq')::TEXT, 3, '0'),
    name        VARCHAR(64) NOT NULL,
    airship_id  VARCHAR(32) REFERENCES airship(id),
    waypoints   JSONB NOT NULL DEFAULT '[]',
    created_by  VARCHAR(32),
    status      VARCHAR(16) DEFAULT 'draft',
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE route_seq START 1;

-- ============================================================
-- 任务
-- ============================================================
CREATE TABLE mission (
    id            VARCHAR(32) PRIMARY KEY DEFAULT 'MIS-' || LPAD(NEXTVAL('mission_seq')::TEXT, 3, '0'),
    name          VARCHAR(128) NOT NULL,
    mission_type  VARCHAR(32) NOT NULL,
    airship_ids   JSONB NOT NULL DEFAULT '[]',
    route_id      VARCHAR(32),
    planned_start TIMESTAMP,
    planned_end   TIMESTAMP,
    priority      INT DEFAULT 3,
    status        VARCHAR(16) DEFAULT 'draft',
    created_by    VARCHAR(32),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE mission_seq START 1;

-- ============================================================
-- 告警规则
-- ============================================================
CREATE TABLE alarm_rule (
    id          VARCHAR(32) PRIMARY KEY,
    name        VARCHAR(64) NOT NULL,
    condition   TEXT NOT NULL,
    level       VARCHAR(16) NOT NULL DEFAULT 'warning',
    enabled     BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 告警记录
-- ============================================================
CREATE TABLE alarm_log (
    id            BIGSERIAL PRIMARY KEY,
    airship_id    VARCHAR(32) REFERENCES airship(id),
    rule_id       VARCHAR(32) REFERENCES alarm_rule(id),
    level         VARCHAR(16) NOT NULL,
    message       TEXT NOT NULL,
    triggered_at  TIMESTAMP DEFAULT NOW(),
    acknowledged  BOOLEAN DEFAULT FALSE,
    ack_by        VARCHAR(32),
    ack_at        TIMESTAMP
);

-- ============================================================
-- 操作审计日志
-- ============================================================
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(32),
    action      VARCHAR(64) NOT NULL,
    target_type VARCHAR(32),
    target_id   VARCHAR(32),
    detail      JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 初始化内置告警规则
-- ============================================================
INSERT INTO alarm_rule (id, name, condition, level, enabled) VALUES
('ALM-001', '链路中断',      '遥测数据中断超过10s',                 'emergency', TRUE),
('ALM-002', '电池低电量',    'SOC < 20%',                           'severe',    TRUE),
('ALM-003', '囊体压差异常',  '压差超出安全范围[150, 400]Pa',         'severe',    TRUE),
('ALM-004', '氦气过温',      '氦气温度超过阈值',                     'warning',   TRUE),
('ALM-005', '强风预警',      '风速超过抗风能力80%',                  'warning',   TRUE),
('ALM-006', '偏离航线',      '实际位置偏离计划航线超阈值',            'warning',   TRUE),
('ALM-007', 'GPS丢失',       'GPS定位精度下降或丢失',               'severe',    TRUE),
('ALM-008', '能源负平衡',    '发电功率 < 消耗功率 持续超过阈值',     'info',      TRUE);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX idx_cmd_airship ON command_log(airship_id, sent_at);
CREATE INDEX idx_alarm_airship ON alarm_log(airship_id, triggered_at);
CREATE INDEX idx_alarm_ack ON alarm_log(acknowledged, triggered_at);
CREATE INDEX idx_audit_user ON audit_log(user_id, created_at);

COMMENT ON TABLE airship IS '飞艇实体表';
COMMENT ON TABLE command_log IS '控制指令日志';
COMMENT ON TABLE route IS '航线表';
COMMENT ON TABLE mission IS '任务表';
COMMENT ON TABLE alarm_rule IS '告警规则';
COMMENT ON TABLE alarm_log IS '告警记录';
COMMENT ON TABLE audit_log IS '操作审计日志';
