from typing import Callable

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    def __init__(self, session_factory: Callable[[], Session] = default_session_factory):
        self._session_factory = session_factory
        self.session: Session | None = None

    def __enter__(self):
        self.session = self._session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.session is None:
            return
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
            self.session = None
