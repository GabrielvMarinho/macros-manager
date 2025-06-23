import websockets
import os
import json

async def send_update(section, id, message):
    uri = f"ws://localhost:8765/sender/{section}/{id}"
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(message)
    except Exception as e:
        print(f"Error connecting to WebSocket: {e}")




def updateWindowsJson(file_name, vaiUsar=False):
    path = f"{os.getcwd()}/windows.json"
    if(vaiUsar):
        return getFreeWindow(file_name)
    else:
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)
            
        with open(path, "w", encoding="utf-8") as file:
            for key, value in data.items():
                if value == str(file_name):
                    data[key] = "null"
                    break
            json.dump(data, file, indent=4)
        return -1



def getFreeWindow(file_name):
    path = f"{os.getcwd()}\windows.json"
    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    for i in range(6):
        if(data[str(i)] == "null"):
            with open (path, "w", encoding="utf-8") as file:
                data[str(i)] = file_name
                json.dump(data, file, indent=4)
                return i
    return -1

def freeWindow():
    path = os.path.join(os.getcwd(), "windows.json")
    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    for i in range(6):
        if data.get(str(i)) == "null":
            return True
    return False