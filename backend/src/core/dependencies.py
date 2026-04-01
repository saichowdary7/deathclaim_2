from fastapi import Request


def get_current_user(request: Request):
    username = request.headers.get("x-user", "John Smith")
    return {"username": username}