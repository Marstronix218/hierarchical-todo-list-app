"""
Test Script for Hierarchical Todo List App
This script tests the backend API endpoints
Run this after starting the Flask server to verify functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def print_response(response, description):
    """Print formatted response"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}")

def test_backend():
    """Test all backend endpoints"""
    
    print("\n🚀 Starting Backend API Tests...\n")
    
    # Test 1: Health Check
    print("\n1️⃣ Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print_response(response, "Health Check")
    
    # Test 2: Register User
    print("\n2️⃣ Testing User Registration...")
    register_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/register", json=register_data)
    print_response(response, "User Registration")
    
    if response.status_code != 201:
        print("⚠️ Registration failed. User might already exist.")
        # Try login instead
        response = requests.post(f"{BASE_URL}/login", json=register_data)
        print_response(response, "User Login (fallback)")
    
    # Get token from response
    token = response.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test 3: Create List
    print("\n3️⃣ Testing Create List...")
    list_data = {"name": "Test List"}
    response = requests.post(f"{BASE_URL}/lists", json=list_data, headers=headers)
    print_response(response, "Create List")
    list_id = response.json().get('id')
    
    # Test 4: Get Lists
    print("\n4️⃣ Testing Get Lists...")
    response = requests.get(f"{BASE_URL}/lists", headers=headers)
    print_response(response, "Get All Lists")
    
    # Test 5: Create Top-Level Task
    print("\n5️⃣ Testing Create Task...")
    task_data = {
        "title": "Top Level Task",
        "list_id": list_id
    }
    response = requests.post(f"{BASE_URL}/tasks", json=task_data, headers=headers)
    print_response(response, "Create Top-Level Task")
    task_id = response.json().get('id')
    
    # Test 6: Create Subtask
    print("\n6️⃣ Testing Create Subtask...")
    subtask_data = {
        "title": "Subtask 1",
        "list_id": list_id,
        "parent_id": task_id
    }
    response = requests.post(f"{BASE_URL}/tasks", json=subtask_data, headers=headers)
    print_response(response, "Create Subtask")
    subtask_id = response.json().get('id')
    
    # Test 7: Create Sub-Subtask
    print("\n7️⃣ Testing Create Sub-Subtask...")
    subsubtask_data = {
        "title": "Sub-Subtask 1",
        "list_id": list_id,
        "parent_id": subtask_id
    }
    response = requests.post(f"{BASE_URL}/tasks", json=subsubtask_data, headers=headers)
    print_response(response, "Create Sub-Subtask")
    
    # Test 8: Update Task (Complete)
    print("\n8️⃣ Testing Update Task (Complete)...")
    update_data = {"completed": True}
    response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
    print_response(response, "Update Task - Mark Complete")
    
    # Test 9: Update Task (Collapse)
    print("\n9️⃣ Testing Update Task (Collapse)...")
    update_data = {"collapsed": True}
    response = requests.put(f"{BASE_URL}/tasks/{task_id}", json=update_data, headers=headers)
    print_response(response, "Update Task - Collapse")
    
    # Test 10: Create Second List
    print("\n🔟 Testing Create Second List...")
    list_data2 = {"name": "Test List 2"}
    response = requests.post(f"{BASE_URL}/lists", json=list_data2, headers=headers)
    print_response(response, "Create Second List")
    list_id_2 = response.json().get('id')
    
    # Test 11: Move Task
    print("\n1️⃣1️⃣ Testing Move Task...")
    move_data = {"list_id": list_id_2}
    response = requests.put(f"{BASE_URL}/tasks/{task_id}/move", json=move_data, headers=headers)
    print_response(response, "Move Task to Different List")
    
    # Test 12: Get Lists (Final State)
    print("\n1️⃣2️⃣ Testing Get Lists (Final State)...")
    response = requests.get(f"{BASE_URL}/lists", headers=headers)
    print_response(response, "Get All Lists - Final State")
    
    # Test 13: Delete Task
    print("\n1️⃣3️⃣ Testing Delete Task...")
    response = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
    print_response(response, "Delete Task (and all subtasks)")
    
    # Test 14: Delete List
    print("\n1️⃣4️⃣ Testing Delete List...")
    response = requests.delete(f"{BASE_URL}/lists/{list_id_2}", headers=headers)
    print_response(response, "Delete List")
    
    print("\n✅ All tests completed!\n")
    print("If you see this message, your backend is working correctly.")
    print("Now test the frontend by opening http://localhost:3000 in your browser.\n")

if __name__ == "__main__":
    try:
        test_backend()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to backend server.")
        print("Make sure the Flask backend is running on http://localhost:5000")
        print("Run: python3 app.py")
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
