import sqlite3
from flask import current_app, g


def get_db():
    """Retorna uma conexão com o banco de dados SQLite atual (por request)."""
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES,
            check_same_thread=False,
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    """Fecha a conexão com o banco de dados no final do request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    """Inicializa o banco de dados executando o schema SQL."""
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf-8'))
