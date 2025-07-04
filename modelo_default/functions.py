import websockets


async def send_update(section, id, message):
    uri = f"ws://localhost:8765/sender/{section}/{id}"
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(message)
    except Exception as e:
        print(f"Error connecting to WebSocket: {e}")


