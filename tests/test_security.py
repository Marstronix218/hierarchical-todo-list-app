"""
Security and isolation test suite
Tests cross-user isolation, authorization, and security features
"""

import os
import requests
import pytest

BASE_URL = os.environ.get("TODO_API_BASE", "http://localhost:5000/api")


@pytest.fixture
def two_users():
    """Fixture to create two authenticated users"""
    # User 1
    username1 = f"security_user1_{os.urandom(4).hex()}"
    response1 = requests.post(
        f"{BASE_URL}/register",
        json={"username": username1, "password": "pass123"}
    )
    token1 = response1.json()["token"]
    headers1 = {"Authorization": f"Bearer {token1}"}
    
    # User 2
    username2 = f"security_user2_{os.urandom(4).hex()}"
    response2 = requests.post(
        f"{BASE_URL}/register",
        json={"username": username2, "password": "pass123"}
    )
    token2 = response2.json()["token"]
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    return {
        "user1": {"username": username1, "headers": headers1, "token": token1},
        "user2": {"username": username2, "headers": headers2, "token": token2}
    }


class TestUserIsolation:
    """Test that users can only access their own data"""
    
    def test_users_see_only_own_lists(self, two_users):
        """Test users can only see their own lists"""
        # User 1 creates a list
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        assert response.status_code == 201
        
        # User 2 creates a list
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 2 List"},
            headers=two_users["user2"]["headers"]
        )
        assert response.status_code == 201
        
        # User 1 should only see their list
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        lists = response.json()
        assert len(lists) == 1
        assert lists[0]["name"] == "User 1 List"
        
        # User 2 should only see their list
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user2"]["headers"]
        )
        lists = response.json()
        assert len(lists) == 1
        assert lists[0]["name"] == "User 2 List"
    
    def test_cannot_update_other_users_list(self, two_users):
        """Test user cannot update another user's list"""
        # User 1 creates a list
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        list_id = response.json()["id"]
        
        # User 2 tries to update User 1's list
        response = requests.put(
            f"{BASE_URL}/lists/{list_id}",
            json={"name": "Hacked Name"},
            headers=two_users["user2"]["headers"]
        )
        assert response.status_code == 403
        
        # Verify list name unchanged
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert response.json()[0]["name"] == "User 1 List"
    
    def test_cannot_delete_other_users_list(self, two_users):
        """Test user cannot delete another user's list"""
        # User 1 creates a list
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        list_id = response.json()["id"]
        
        # User 2 tries to delete User 1's list
        response = requests.delete(
            f"{BASE_URL}/lists/{list_id}",
            headers=two_users["user2"]["headers"]
        )
        assert response.status_code == 403
        
        # Verify list still exists
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert len(response.json()) == 1
    
    def test_cannot_create_task_in_other_users_list(self, two_users):
        """Test user cannot create task in another user's list"""
        # User 1 creates a list
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        list_id = response.json()["id"]
        
        # User 2 tries to create task in User 1's list
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "Unauthorized Task", "list_id": list_id},
            headers=two_users["user2"]["headers"]
        )
        assert response.status_code == 403
        
        # Verify no task was created
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert len(response.json()[0]["tasks"]) == 0
    
    def test_cannot_update_other_users_task(self, two_users):
        """Test user cannot update another user's task"""
        # User 1 creates a list and task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "User 1 Task", "list_id": list_id},
            headers=two_users["user1"]["headers"]
        )
        task_id = task_response.json()["id"]
        
        # User 2 tries to update User 1's task
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}",
            json={"title": "Hacked Task", "completed": True},
            headers=two_users["user2"]["headers"]
        )
        assert response.status_code == 403
        
        # Verify task unchanged
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        task = response.json()[0]["tasks"][0]
        assert task["title"] == "User 1 Task"
        assert task["completed"] is False
    
    def test_cannot_delete_other_users_task(self, two_users):
        """Test user cannot delete another user's task"""
        # User 1 creates a list and task
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        list_id = list_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "User 1 Task", "list_id": list_id},
            headers=two_users["user1"]["headers"]
        )
        task_id = task_response.json()["id"]
        
        # User 2 tries to delete User 1's task
        response = requests.delete(
            f"{BASE_URL}/tasks/{task_id}",
            headers=two_users["user2"]["headers"]
        )
        assert response.status_code == 403
        
        # Verify task still exists
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert len(response.json()[0]["tasks"]) == 1
    
    def test_cannot_move_task_to_other_users_list(self, two_users):
        """Test user cannot move task to another user's list"""
        # User 1 creates a list and task
        list1_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 1 List"},
            headers=two_users["user1"]["headers"]
        )
        list1_id = list1_response.json()["id"]
        
        task_response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": "User 1 Task", "list_id": list1_id},
            headers=two_users["user1"]["headers"]
        )
        task_id = task_response.json()["id"]
        
        # User 2 creates a list
        list2_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "User 2 List"},
            headers=two_users["user2"]["headers"]
        )
        list2_id = list2_response.json()["id"]
        
        # User 1 tries to move their task to User 2's list
        response = requests.put(
            f"{BASE_URL}/tasks/{task_id}/move",
            json={"list_id": list2_id},
            headers=two_users["user1"]["headers"]
        )
        assert response.status_code == 403
        
        # Verify task is still in User 1's list
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert len(response.json()[0]["tasks"]) == 1


class TestAuthorization:
    """Test authorization and token validation"""
    
    def test_missing_authorization_header(self):
        """Test request without Authorization header fails"""
        response = requests.get(f"{BASE_URL}/lists")
        assert response.status_code == 401
        assert "authorization" in response.json()["error"].lower()
    
    def test_malformed_authorization_header(self):
        """Test request with malformed Authorization header fails"""
        headers = {"Authorization": "InvalidFormat token123"}
        response = requests.get(f"{BASE_URL}/lists", headers=headers)
        assert response.status_code == 401
    
    def test_invalid_token(self):
        """Test request with invalid token fails"""
        headers = {"Authorization": "Bearer invalid_token_xyz123"}
        response = requests.get(f"{BASE_URL}/lists", headers=headers)
        assert response.status_code == 401
    
    def test_empty_token(self):
        """Test request with empty token fails"""
        headers = {"Authorization": "Bearer "}
        response = requests.get(f"{BASE_URL}/lists", headers=headers)
        assert response.status_code == 401
    
    def test_token_required_for_all_protected_routes(self):
        """Test all protected routes require token"""
        protected_routes = [
            ("GET", f"{BASE_URL}/lists"),
            ("POST", f"{BASE_URL}/lists"),
            ("POST", f"{BASE_URL}/tasks"),
        ]
        
        for method, url in protected_routes:
            if method == "GET":
                response = requests.get(url)
            elif method == "POST":
                response = requests.post(url, json={})
            
            assert response.status_code == 401, f"{method} {url} should require auth"


class TestInputValidation:
    """Test input validation and sanitization"""
    
    def test_register_missing_username(self):
        """Test registration without username fails"""
        response = requests.post(
            f"{BASE_URL}/register",
            json={"password": "pass123"}
        )
        assert response.status_code == 400
    
    def test_register_missing_password(self):
        """Test registration without password fails"""
        response = requests.post(
            f"{BASE_URL}/register",
            json={"username": "testuser"}
        )
        assert response.status_code == 400
    
    def test_login_missing_credentials(self):
        """Test login without credentials fails"""
        response = requests.post(f"{BASE_URL}/login", json={})
        assert response.status_code == 400
    
    def test_create_list_missing_name(self, two_users):
        """Test creating list without name fails"""
        response = requests.post(
            f"{BASE_URL}/lists",
            json={},
            headers=two_users["user1"]["headers"]
        )
        assert response.status_code == 400
    
    def test_create_task_missing_fields(self, two_users):
        """Test creating task without required fields fails"""
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={},
            headers=two_users["user1"]["headers"]
        )
        assert response.status_code == 400
    
    def test_special_characters_in_list_name(self, two_users):
        """Test list names with special characters are handled"""
        special_name = "List <script>alert('xss')</script> & symbols!"
        response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": special_name},
            headers=two_users["user1"]["headers"]
        )
        assert response.status_code == 201
        
        # Verify stored correctly
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert response.json()[0]["name"] == special_name
    
    def test_special_characters_in_task_title(self, two_users):
        """Test task titles with special characters are handled"""
        # Create list first
        list_response = requests.post(
            f"{BASE_URL}/lists",
            json={"name": "Test List"},
            headers=two_users["user1"]["headers"]
        )
        list_id = list_response.json()["id"]
        
        special_title = "Task with 'quotes' & <tags> and émojis 🚀"
        response = requests.post(
            f"{BASE_URL}/tasks",
            json={"title": special_title, "list_id": list_id},
            headers=two_users["user1"]["headers"]
        )
        assert response.status_code == 201
        
        # Verify stored correctly
        response = requests.get(
            f"{BASE_URL}/lists",
            headers=two_users["user1"]["headers"]
        )
        assert response.json()[0]["tasks"][0]["title"] == special_title
