from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Subreddit(Base):
    __tablename__ = "subreddit"

    db_id = Column(Integer, primary_key=True)
    name = Column(String)


class Link(Base):
    __tablename__ = "link"

    db_id = Column(Integer, primary_key=True)
    post_id = Column(String)
    post_timestamp = Column(DateTime)
    source_subreddit_db_id = Column(Integer, ForeignKey("subreddit.db_id"))
    target_subreddit_db_id = Column(Integer, ForeignKey("subreddit.db_id"))
    source_subreddit_name = Column(String)
    target_subreddit_name = Column(String)
    post_label = Column(Integer)
