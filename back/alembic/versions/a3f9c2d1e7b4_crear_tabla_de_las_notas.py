"""crear tabla de las notas

Revision ID: a3f9c2d1e7b4
Revises: d807188d162e
Create Date: 2026-09-22 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3f9c2d1e7b4'
down_revision: Union[str, Sequence[str], None] = 'd807188d162e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('notas',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('contenido', sa.Text(), nullable=False),
    sa.Column('fecha', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('estudiante_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['estudiante_id'], ['estudiantes.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notas_estudiante_id'), 'notas', ['estudiante_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_notas_estudiante_id'), table_name='notas')
    op.drop_table('notas')
