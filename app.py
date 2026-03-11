import sqlite3
import uuid
from datetime import datetime

from flask import Flask, abort, jsonify, render_template, request

from database import close_db, get_db, init_db


def create_app():

    app = Flask(__name__, template_folder="templates", static_folder="static")

    app.config.from_mapping(
        DATABASE="database.db",
        JSONIFY_PRETTYPRINT_REGULAR=False,
    )

    app.teardown_appcontext(close_db)

    with app.app_context():
        init_db()

    def row_to_dict(row):
        return dict(row) if row else None

    # ----------------------
    # PÁGINAS HTML
    # ----------------------

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/funcionalidades/<page>")
    def funcionalidade(page):

        allowed = [
            "Cadastro",
            "Agendamento",
            "Registros",
            "lista-edicao-pacientes",
            "Relatorios",
            "Financeiro",
        ]

        if page not in allowed:
            abort(404)

        return render_template(f"funcionalidades/{page}.html")

    # ----------------------
    # PACIENTES
    # ----------------------

    @app.route("/api/pacientes", methods=["GET"])
    def list_pacientes():

        db = get_db()

        rows = db.execute(
            "SELECT * FROM pacientes ORDER BY nome"
        ).fetchall()

        return jsonify([row_to_dict(r) for r in rows])

    @app.route("/api/pacientes", methods=["POST"])
    def create_paciente():

        data = request.get_json()

        new_id = str(uuid.uuid4())

        db = get_db()

        db.execute(
            """
            INSERT INTO pacientes
            (id, nome, idade, escola, responsavel, telefone, email, observacoes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id,
                data.get("nome"),
                data.get("idade"),
                data.get("escola"),
                data.get("responsavel"),
                data.get("telefone"),
                data.get("email"),
                data.get("observacoes"),
                datetime.utcnow().isoformat(),
            ),
        )

        db.commit()

        return jsonify({"id": new_id})

    # ----------------------
    # AGENDA
    # ----------------------

    @app.route("/api/agenda", methods=["GET"])
    def list_agenda():

        db = get_db()

        rows = db.execute(
            "SELECT * FROM agenda ORDER BY data, horario"
        ).fetchall()

        return jsonify([row_to_dict(r) for r in rows])

    @app.route("/api/agenda", methods=["POST"])
    def create_agenda():

        data = request.get_json()

        db = get_db()

        new_id = str(uuid.uuid4())

        db.execute(
            """
            INSERT INTO agenda
            (id, paciente_id, data, horario, status, motivo, profissional, observacoes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id,
                data.get("paciente_id"),
                data.get("data"),
                data.get("horario"),
                data.get("status", "agendado"),
                data.get("motivo"),
                data.get("profissional"),
                data.get("observacoes"),
                datetime.utcnow().isoformat(),
            ),
        )

        db.commit()

        return jsonify({"id": new_id})

    # ----------------------
    # SESSÕES
    # ----------------------

    @app.route("/api/sessoes", methods=["GET"])
    def list_sessoes():

        db = get_db()

        rows = db.execute(
            "SELECT * FROM sessoes ORDER BY data DESC"
        ).fetchall()

        return jsonify([row_to_dict(r) for r in rows])

    @app.route("/api/sessoes", methods=["POST"])
    def create_sessao():

        data = request.get_json()

        db = get_db()

        new_id = str(uuid.uuid4())

        db.execute(
            """
            INSERT INTO sessoes
            (id, paciente_id, data, atividade, observacoes, evolucao, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id,
                data.get("paciente_id"),
                data.get("data"),
                data.get("atividade"),
                data.get("observacoes"),
                data.get("evolucao"),
                datetime.utcnow().isoformat(),
            ),
        )

        db.commit()

        return jsonify({"id": new_id})

    # ----------------------
    # FINANCEIRO
    # ----------------------

    @app.route("/api/financeiro", methods=["GET"])
    def list_financeiro():

        db = get_db()

        rows = db.execute(
            "SELECT * FROM financeiro ORDER BY data DESC"
        ).fetchall()

        return jsonify([row_to_dict(r) for r in rows])

    @app.route("/api/financeiro", methods=["POST"])
    def create_financeiro():

        data = request.get_json()

        db = get_db()

        new_id = str(uuid.uuid4())

        db.execute(
            """
            INSERT INTO financeiro
            (id, paciente_id, data, valor, status, metodo_pagamento, observacoes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id,
                data.get("paciente_id"),
                data.get("data"),
                float(data.get("valor")),
                data.get("status"),
                data.get("metodo_pagamento"),
                data.get("observacoes"),
                datetime.utcnow().isoformat(),
            ),
        )

        db.commit()

        return jsonify({"id": new_id})

    # ----------------------
    # REGISTROS
    # ----------------------

    @app.route("/api/registros", methods=["GET"])
    def list_registros():

        db = get_db()

        rows = db.execute(
            """
            SELECT * FROM registros
            ORDER BY data DESC, hora DESC
            """
        ).fetchall()

        return jsonify([row_to_dict(r) for r in rows])

    @app.route("/api/registros", methods=["POST"])
    def create_registro():

        data = request.get_json()

        db = get_db()

        new_id = str(uuid.uuid4())

        db.execute(
            """
            INSERT INTO registros
            (id, paciente_id, paciente_nome, data, hora, observacoes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id,
                data.get("paciente_id"),
                data.get("paciente_nome"),
                data.get("data"),
                data.get("hora"),
                data.get("observacoes"),
                datetime.utcnow().isoformat(),
            ),
        )

        db.commit()

        return jsonify({"id": new_id})

    return app


if __name__ == "__main__":

    app = create_app()

    app.run(debug=True)

    