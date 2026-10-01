import enum

from sqlalchemy import Enum


class UserRole(str, enum.Enum):
    bidder = "bidder"
    seller = "seller"
    admin = "admin"