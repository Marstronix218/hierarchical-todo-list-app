import os
import requests
import pytest

BASE_URL = os.environ.get("TODO_API_BASE", "http://localhost:5000/api")


@pytest.fixture(scope="session")
def auth_headers():
    # Register or login
    creds = {"username": "ext_user", "password": "ext_pass_123"}
    r = requests.post(f"{BASE_URL}/register", json=creds)
    if r.status_code != 201:
        # fallback to login if exists
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


def find_task(tree_lists, task_id):
    # DFS search through lists
    stack = []
    for lst in tree_lists:
        for t in lst.get("tasks", []):
            stack.append(t)
    while stack:
        n = stack.pop()
        if n["id"] == task_id:
            return n
        stack.extend(n.get("children", []))
    return None


def test_infinite_nesting_and_move(auth_headers):
    # Create two lists
    list_a = create_list("A", auth_headers)
    list_b = create_list("B", auth_headers)

    # Build a 5-deep chain to ensure deep nesting works
    task_ids = []
    parent = None
    for i in range(1, 6):
        tid, _ = create_task(
            f"Task {i}", list_a, auth_headers, parent_id=parent
        )
        task_ids.append(tid)
        parent = tid
    
    task1_id, task2_id, task3_id, task4_id, task5_id = task_ids

    # Add a sibling branch under Task 2 (create tasks to move around)
    sib_id, _ = create_task(
        "Sibling under 2", list_a, auth_headers, parent_id=task2_id
    )

    # Cycle prevention: try to move Task 2 under Task 5 (its descendant)
    r = requests.put(
        f"{BASE_URL}/tasks/{task2_id}/move",
        json={"list_id": list_a, "parent_id": task5_id},
        headers=auth_headers,
    )
    assert r.status_code == 400
    assert "descendant" in r.json().get("error", "").lower()

    # Legit move: move the sibling from under Task 2 to top-level in list B
    r = requests.put(
        f"{BASE_URL}/tasks/{sib_id}/move",
        json={"list_id": list_b, "parent_id": None},
        headers=auth_headers,
    )
    assert r.status_code == 200

    # Verify new location
    lists = get_lists(auth_headers)
    moved = find_task(lists, sib_id)
    assert moved is not None
    assert moved["list_id"] == list_b
    assert moved["parent_id"] is None

    # Move Task 5 under Task 3 (reparent inside same list)
    r = requests.put(
        f"{BASE_URL}/tasks/{task5_id}/move",
        json={"parent_id": task3_id, "list_id": list_a},
        headers=auth_headers,
    )
    assert r.status_code == 200

    # Verify
    lists = get_lists(auth_headers)
    moved2 = find_task(lists, task5_id)
    assert moved2 is not None
    assert moved2["parent_id"] == task3_id
    assert moved2["list_id"] == list_a
