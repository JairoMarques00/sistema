-- Esquema de banco de dados para o sistema de gestão

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS pacientes (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  idade INTEGER,
  escola TEXT,
  responsavel TEXT,
  telefone TEXT,
  email TEXT,
  observacoes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS agenda (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  data TEXT NOT NULL,
  horario TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'agendado',
  motivo TEXT,
  profissional TEXT,
  observacoes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessoes (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  data TEXT NOT NULL,
  atividade TEXT,
  observacoes TEXT,
  evolucao TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS financeiro (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  data TEXT NOT NULL,
  valor REAL NOT NULL,
  status TEXT NOT NULL,
  metodo_pagamento TEXT,
  observacoes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS registros (
  id TEXT PRIMARY KEY,
  paciente_id TEXT NOT NULL,
  paciente_nome TEXT,
  data TEXT NOT NULL,
  hora TEXT NOT NULL,
  observacoes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0,
  linked_date TEXT,
  created_at TEXT NOT NULL
);

