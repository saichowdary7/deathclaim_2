from datetime import datetime


def success_response(data, request):
    return {
        "success": True,
        "data": data,
        "meta": {
            "request_id": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat()
        }
    }


def error_response(code, message, request, details=None):
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or []
        },
        "meta": {
            "request_id": getattr(request.state, "request_id", None),
            "timestamp": datetime.utcnow().isoformat()
        }
    }