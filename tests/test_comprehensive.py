"""
Comprehensive test suite for the Hierarchical Todo List App
Tests all major functionality including authentication, lists, tasks, and edge cases
"""

import os
import requests
import pytest

BASE_URL = os.environ.get("TODO_API_BASE", "http://localhost:5000/api")


class TestAuthentication:
    """Test user authentication and authorization"""
    
    def test_register_new_user(self):
        """Test registering a new user"""
        username = f"test_user_{os.urandom(4).hex()}"
        response = requests.post(
            f"{BASE_URL}/register",
            json={"username": username, "password": "testpass123"}
        )
        assert response.status_code == 201
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["username"] == username
    
    def test_register_duplicate_user(self):
        """Test registering with existing username fails"""
        username = f"duplicate_user_{os.urandom(4).hex()}"
        creds = {"username": username, "password": "pass123"}
        
        # First registration
        response = requests.post(f"{BASE_URL}/register", json=creds)
        assert response.status_code == 201
        
        # Duplicate registration
        response = requests.post(f"{BASE_URL}/register", json=creds)
        assert response.status_code == 400
        assert "already exists" in response.json()["error"].lower()
    
    def test_login_success(self):
        """Test successful login"""
        username = f"login_user_{os.urandom(4).hex()}"
        password = "loginpass123"
        
        # Register
        requests.post(
            f"{BASE_URL}/register",
            json={"username": username, "password": password}
        )
        
        # Login
        response = requests.post(
            f"{BASE_URL}/login",
            json={"username": username, "password": password}
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["username"] == username
    
    def test_login_wrong_password(self):
        """Test login with wrong password fails"""
        username = f"wrong_pass_user_{os.urandom(4).hex()}"
        
        # Register
        requests.post(
            f"{BASE_URL}/register",
            json={"username": username, "password": "correct_pass"}
        )
        
        # Login with wrong password
        response = requests.post(
            f"{BASE_URL}/login",
            json={"username": username, "password": "wrong_pass"}
        )
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent user fails"""
        response = requests.post(
            f"{BASE_URL}/login",
            json={"username": "nonexistent_user_xyz", "password": "anypass"}
        )
        assert response.status_code == 401
    
    def test_protected_route_without_token(self):
        """Test accessing protected route without token fails"""
        response = requests.get(f"{BASE_URL}/lists")
        assert response.status_code == 401
    
    def test_protected_route_with_invalid_token(self):
        """Test accessing protected route with invalid token fails"""
        headers = {"Authorization": "Bearer invalid_token_xyz"}
        response = requests.get(f"{BASE_URL}/lists", headers=headers)
        assert response.status_code == 401


@pytest.fixture
def auth_user():
    """Fixture to create an authenticated user"""
    username = f"fixture_user_{os.urandom(4).hex()}"
    password = "fixturepass123"
    
    response = requests.post(
        f"{BASE_URL}/register",
        json={"username": username, "password": password}
    )
    token = response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    return {"username": username, "password": password, "token": token, "headers": headers}


class TestLists:
    """Test todo list management"""
    
    def test_create_list(self, auth_user):
        """Test creating a new list"""
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "My Test List"},
            headers=auth_user["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "My Test List"
        assert "id" in data
        assert data["tasks"] == []
    
    def test_get_lists_empty(self, auth_user):
        """Test getting lists when user has none"""
        response = requests.get(f"{BASE_URL}/lists", headers=auth_user["headers"])
        assert response.status_code == 200
        assert response.json() == []
    
    def test_get_lists_with_data(self, auth_user):
        """Test getting lists returns created lists"""
        # Create two lists
        requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List 1"},
            headers=auth_user["headers"]
        )
        requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List 2"},
            headers=auth_user["headers"]
        )
        
        response = requests.get(f"{BASE_URL}/lists", headers=auth_user["headers"])
        assert response.status_code == 200
        lists = response.json()
        assert len(lists) == 2
        assert lists[0]["name"] == "List 1"
        assert lists[1]["name"] == "List 2"
    
    def test_update_list_name(self, auth_user):
        """Test updating a list's name"""
        # Create list
        create_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "Original Name"},
            headers=auth_user["headers"]
        )
        list_id = create_response.json()["id"]
        
        # Update list
        response = requests.put(
            f"{BASE_URL}/lists/{list_id}",
            json={"name": "Updated Name"},
            headers=auth_user["headers"]
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"
    
    def test_delete_list(self, auth_user):
        """Test deleting a list"""
        # Create list
        create_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List to Delete"},
            headers=auth_user["headers"]
        )
        list_id = create_response.json()["id"]
        
        # Delete list
        response = requests.delete(
            f"{BASE_URL}/lists/{list_id}",
            headers=auth_user["headers"]
        )
        assert response.status_code == 200
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/lists", headers=auth_user["headers"])
        assert len(get_response.json()) == 0
    
    def test_cannot_access_other_users_list(self, auth_user):
        """Test that users cannot access other users' lists"""
        # Create list as first user
        create_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=auth_user["headers"]
        )
        list_id = create_response.json()["id"]
        
        # Create second user
        username2 = f"other_user_{os.urandom(4).hex()}"
        response2 = requests.post(
            f"{BASE_URL}/register",
            json={"username": username2, "password": "pass123"}
        )
        headers2 = {"Authorization": f"Bearer {response2.json()['token']}"}
        
        # Try to update first user's list as second user
        response = requests.put(
            f"{BASE_URL}/lists/{list_id}",
            json={"name": "Hacked Name"},
            headers=headers2
        )
        assert response.status_code == 403


class TestTasks:
    """Test task management"""
    
    def test_create_top_level_task(self, auth_user):
        """Test creating a top-level task"""
        # Create list
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "Task List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        # Create task
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Top Level Task", "list_id": list_id},
            headers=auth_user["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Top Level Task"
        assert data["list_id"] == list_id
        assert data["parent_id"] is None
        assert data["completed"] is False
        assert data["collapsed"] is False
    
    def test_create_subtask(self, auth_user):
        """Test creating a subtask"""
        # Create list and parent task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        parent_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Parent Task", "list_id": list_id},
            headers=auth_user["headers"]
        )
        parent_id = parent_response.json()["id"]
        
        # Create subtask
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Subtask", "list_id": list_id, "parent_id": parent_id},
            headers=auth_user["headers"]
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Subtask"
        assert data["parent_id"] == parent_id
    
    def test_update_task_completed(self, auth_user):
        """Test marking a task as completed"""
        # Create list and task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task", "list_id": list_id},
            headers=auth_user["headers"]
        )
        task_id = task_response.json()["id"]
        
        # Mark completed
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"completed": True},
            headers=auth_user["headers"]
        )
        assert response.status_code == 200
        assert response.json()["completed"] is True
    
    def test_update_task_collapsed(self, auth_user):
        """Test collapsing a task"""
        # Create list and task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task", "list_id": list_id},
            headers=auth_user["headers"]
        )
        task_id = task_response.json()["id"]
        
        # Collapse
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"collapsed": True},
            headers=auth_user["headers"]
        )
        assert response.status_code == 200
        assert response.json()["collapsed"] is True
    
    def test_update_task_title(self, auth_user):
        """Test updating a task's title"""
        # Create list and task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Original Title", "list_id": list_id},
            headers=auth_user["headers"]
        )
        task_id = task_response.json()["id"]
        
        # Update title
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"title": "Updated Title"},
            headers=auth_user["headers"]
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated Title"
    
    def test_delete_task(self, auth_user):
        """Test deleting a task"""
        # Create list and task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task to Delete", "list_id": list_id},
            headers=auth_user["headers"]
        )
        task_id = task_response.json()["id"]
        
        # Delete task
        response = requests.delete(
            f"{BASE_URL}/tasks/{task_id}",
            headers=auth_user["headers"]
        )
        assert response.status_code == 200
        
        # Verify deletion
        lists_response = requests.get(f"{BASE_URL}/lists", headers=auth_user["headers"])
        tasks = lists_response.json()[0]["tasks"]
        assert len(tasks) == 0
    
    def test_delete_task_cascade(self, auth_user):
        """Test that deleting a parent task deletes all subtasks"""
        # Create list and nested tasks
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        parent_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Parent", "list_id": list_id},
            headers=auth_user["headers"]
        )
        parent_id = parent_response.json()["id"]
        
        # Create subtask
        requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Child", "list_id": list_id, "parent_id": parent_id},
            headers=auth_user["headers"]
        )
        
        # Delete parent
        requests.delete(
            f"{BASE_URL}/tasks/{parent_id}",
            headers=auth_user["headers"]
        )
        
        # Verify both are deleted
        lists_response = requests.get(f"{BASE_URL}/lists", headers=auth_user["headers"])
        tasks = lists_response.json()[0]["tasks"]
        assert len(tasks) == 0
    
    def test_cannot_access_other_users_task(self, auth_user):
        """Test that users cannot modify other users' tasks"""
        # Create list and task as first user
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task", "list_id": list_id},
            headers=auth_user["headers"]
        )
        task_id = task_response.json()["id"]
        
        # Create second user
        username2 = f"other_user_{os.urandom(4).hex()}"
        response2 = requests.post(
            f"{BASE_URL}/register",
            json={"username": username2, "password": "pass123"}
        )
        headers2 = {"Authorization": f"Bearer {response2.json()['token']}"}
        
        # Try to update first user's task as second user
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"title": "Hacked", "completed": True},
            headers=headers2
        )
        assert response.status_code == 403


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_create_list_empty_name(self, auth_user):
        """Test creating a list with empty name fails"""
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": ""},
            headers=auth_user["headers"]
        )
        assert response.status_code == 400
    
    def test_create_task_empty_title(self, auth_user):
        """Test creating a task with empty title fails"""
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "", "list_id": list_id},
            headers=auth_user["headers"]
        )
        assert response.status_code == 400
    
    def test_create_task_invalid_list(self, auth_user):
        """Test creating a task with non-existent list_id fails"""
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task", "list_id": 99999},
            headers=auth_user["headers"]
        )
        # Returns 403 because list doesn't exist or doesn't belong to user
        assert response.status_code == 403
    
    def test_create_subtask_invalid_parent(self, auth_user):
        """Test creating a subtask with non-existent parent_id fails"""
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "List"},
            headers=auth_user["headers"]
        )
        list_id = list_response.json()["id"]
        
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Task", "list_id": list_id, "parent_id": 99999},
            headers=auth_user["headers"]
        )
        # Returns 400 for invalid parent_id
        assert response.status_code == 400
    
    def test_update_nonexistent_task(self, auth_user):
        """Test updating a non-existent task fails"""
        response = requests.put(
            f"{BASE_URL}/tasks/99999",
            json={"title": "Updated"},
            headers=auth_user["headers"]
        )
        assert response.status_code == 404
    
    def test_delete_nonexistent_task(self, auth_user):
        """Test deleting a non-existent task fails"""
        response = requests.delete(
            f"{BASE_URL}/tasks/99999",
            headers=auth_user["headers"]
        )
        assert response.status_code == 404
    
    def test_update_nonexistent_list(self, auth_user):
        """Test updating a non-existent list fails"""
        response = requests.put(
            f"{BASE_URL}/lists/99999",
            json={"name": "Updated"},
            headers=auth_user["headers"]
        )
        assert response.status_code == 404
    
    def test_delete_nonexistent_list(self, auth_user):
        """Test deleting a non-existent list fails"""
        response = requests.delete(
            f"{BASE_URL}/lists/99999",
            headers=auth_user["headers"]
        )
        assert response.status_code == 404
