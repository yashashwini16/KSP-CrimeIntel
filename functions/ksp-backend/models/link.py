from sqlalchemy import Enum, Float, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class CriminalLink(Base):
    __tablename__ = "criminal_links"
    __table_args__ = (
        Index("idx_criminal_links_source_id", "source_id"),
        Index("idx_criminal_links_target_id", "target_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_id: Mapped[int] = mapped_column(
        ForeignKey("Accused.AccusedMasterID", ondelete="CASCADE"), nullable=False
    )
    target_id: Mapped[int] = mapped_column(
        ForeignKey("Accused.AccusedMasterID", ondelete="CASCADE"), nullable=False
    )
    link_type: Mapped[str] = mapped_column(
        Enum("co_accused", "association", "hierarchy"), nullable=False
    )
    weight: Mapped[float] = mapped_column(
        Float, nullable=False, default=1.0, server_default="1.0"
    )

