import asyncio
import types

import backend.server as server


def test_register_succeeds_without_database(monkeypatch):
    class FailingCollection:
        async def find_one(self, *args, **kwargs):
            raise RuntimeError("database unavailable")

        async def insert_one(self, *args, **kwargs):
            raise RuntimeError("database unavailable")

    class FailingDB:
        users = FailingCollection()
        user_sessions = FailingCollection()

    monkeypatch.setattr(server, "db", FailingDB())

    async def run_test():
        response = await server.register(
            server.UserRegister(email="new@example.com", password="secret123", name="New User")
        )
        assert response.status_code == 200
        body = response.body.decode()
        assert "Register success" in body

    asyncio.run(run_test())
