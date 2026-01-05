from sqlmodel import create_engine, Session
postgres_url = "postgresql://omniapi:omniapi@10.0.0.21/omniapi"
engine = create_engine(postgres_url, echo=True)  # echo=True logs SQL queries

def get_session():
    with Session(engine) as session:
        yield session
def get_sync_session():
    session = Session(engine)
    try:
        return session
    except:
        session.close()
        raise