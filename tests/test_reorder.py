import os
import requests
import pytest

BASE_URL = os.environ.get("TODO_API_BASE", "http://localhost:5000/api")


@pytest.fixture(scope="session")
def auth_headers():
    creds = {"username": "reorder_user", "password": "reorder_pass"}
    r = requests.post(f"{BASE_URL}/register", json=creds)
    if r.status_code != 201:
        r = requests.post(f"{BASE_URL}/login", json=creds)
        assert r.status_code == 200
    token = r.json()["token"]
    return {"Authorization": f"Bearer {token}"}


def create_list(name, headers):
    r = requests.post(
        f"{BASE_URL}/lists", json={"name": name}, headers=headers
    )
    assert r.status_code == 201
    return r.json()["id"]


def create_task(title, list_id, headers, parent_id=None):
    payload = {"title": title, "list_id": list_id}
    if parent_id is not None:
        payload["parent_id"] = parent_id
    r = requests.post(f"{BASE_URL}/tasks", json=payload, headers=headers)
    assert r.status_code == 201
    return r.json()["id"], r.json()


def get_lists(headers):
    r = requests.get(f"{BASE_URL}/lists", headers=headers)
    assert r.status_code == 200
    return r.json()


def test_reorder_tasks(auth_headers):
    # Create a list and three tasks
    list_id = create_list("Reorder Test", auth_headers)
    
    task1_id, _ = create_task("Task 1", list_id, auth_headers)
    task2_id, _ = create_task("Task 2", list_id, auth_headers)
    task3_id, _ = create_task("Task 3", list_id, auth_headers)
    
    # Helper to get tasks for our specific list
    def get_our_tasks():
        lists = get_lists(auth_headers)
        our_list = next(lst for lst in lists if lst["id"] == list_id)
        return our_list["tasks"]
    
    # Initial order should be 1, 2, 3 (positions 0, 1, 2)
    tasks = get_our_tasks()
    assert len(tasks) == 3
    assert tasks[0]["title"] == "Task 1"
    assert tasks[1]["title"] == "Task 2"
    assert tasks[2]["title"] == "Task 3"
    
    # Move task 2 up (should swap with task 1)
    r = requests.put(
        f"{BASE_URL}/tasks/{task2_id}/reorder",
        json={"direction": "up"},
        headers=auth_headers
    )
    assert r.status_code == 200
    
    # Check new order: 2, 1, 3
    tasks = get_our_tasks()
    assert tasks[0]["title"] == "Task 2"
    assert tasks[1]["title"] == "Task 1"
    assert tasks[2]["title"] == "Task 3"
    
    # Move task 1 down (should swap with task 3)
    r = requests.put(
        f"{BASE_URL}/tasks/{task1_id}/reorder",
        json={"direction": "down"},
        headers=auth_headers
    )
    assert r.status_code == 200
    
    # Check new order: 2, 3, 1
    tasks = get_our_tasks()
    assert tasks[0]["title"] == "Task 2"
    assert tasks[1]["title"] == "Task 3"
    assert tasks[2]["title"] == "Task 1"
    
    # Try to move task 2 up when already at top (no-op)
    r = requests.put(
        f"{BASE_URL}/tasks/{task2_id}/reorder",
        json={"direction": "up"},
        headers=auth_headers
    )
    assert r.status_code == 200
    
    # Order should still be 2, 3, 1
    tasks = get_our_tasks()
    assert tasks[0]["title"] == "Task 2"
    assert tasks[1]["title"] == "Task 3"
    assert tasks[2]["title"] == "Task 1"
