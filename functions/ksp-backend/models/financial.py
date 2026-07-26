from datetime import date
from decimal import Decimal

from sqlalchemy import Date, ForeignKey, Index, Integer, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    __table_args__ = (
        Index("idx_financial_transactions_CaseMasterID", "CaseMasterID"),
        Index("idx_financial_transactions_AccusedMasterID", "AccusedMasterID"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    CaseMasterID: Mapped[int | None] = mapped_column(
        ForeignKey("CaseMaster.CaseMasterID", ondelete="CASCADE"), nullable=True
    )
    AccusedMasterID: Mapped[int | None] = mapped_column(
        ForeignKey("Accused.AccusedMasterID", ondelete="CASCADE"), nullable=True
    )
    amount: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    transaction_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships are loosely coupled since we removed strict relationship imports.
