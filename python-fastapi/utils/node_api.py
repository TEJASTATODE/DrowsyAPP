import httpx
import os


NODE_API_URL = os.getenv("NODE_URL", "http://localhost:5000/api")

async def send_drowsy_data(data, session_id=None, token=None):
    """
    Sends data to Node.js. 
    Now stateless: Pass session_id and token as arguments.
    """
    
    if not session_id:
       
        return

  
    payload = data.copy()
    payload["sessionId"] = session_id

  
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = f"{NODE_API_URL}/drowsiness/create"

    
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code in [200, 201]:
            
                pass
            else:
                print(f"[Node API Error] Server replied: {response.status_code} - {response.text}")

    except httpx.ConnectError:
        print(f"[Node API Warning] Could not connect to {NODE_API_URL}. Is Node running?")
    except httpx.TimeoutException:
        print("[Node API Warning] Request timed out. Node is too slow.")
    except Exception as e:
        print(f"[Node API Error] Unexpected: {e}")