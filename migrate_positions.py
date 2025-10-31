"""
Migration script to add position field to existing tasks.
Run this once after updating the Task model with the position field.
"""

from app import app, db, Task

def migrate_add_positions():
    """Add position values to all existing tasks based on creation order."""
    with app.app_context():
        # Get all unique (list_id, parent_id) combinations
        groups = db.session.query(
            Task.list_id,
            Task.parent_id
        ).distinct().all()
        
        for list_id, parent_id in groups:
            # Get tasks in this group ordered by creation
            tasks = Task.query.filter_by(
                list_id=list_id,
                parent_id=parent_id
            ).order_by(Task.created_at).all()
            
            # Assign positions
            for idx, task in enumerate(tasks):
                task.position = idx
        
        db.session.commit()
        print(f"✅ Migrated {Task.query.count()} tasks with positions")

if __name__ == '__main__':
    print("Starting position migration...")
    migrate_add_positions()
    print("Migration complete!")
