import multiprocessing.connection
import win32com.client
import threading
import websockets
import asyncio
from database.database import *
import json
import webview
import pandas as pd
import tempfile
from Office365.Office import Office365 
from collections import deque
import os
import multiprocessing
import urllib.parse
from pathlib import Path
from selenium import webdriver
#external imports
import sys
import time
import subprocess
import pyautogui
from cachetools import cached, TTLCache
MACRO_EXECUTED = "macro_executed"
MACRO_ERROR = "macro_error"

def run_macro_module(sap_window, fileContent, section, file, params=None):
        obj = {"section_parent_folder": section, "parent_folder": file, "sap_window":sap_window}
        if params:
            obj["params"] = params
        
        sys.argv.append(json.dumps(obj))


        # data = io.StringIO()
        # sys.stdout = data

        exec(fileContent)
        
        # sys.stdout = sys.__stdout__

        # logs = data.getvalue()

        





cache = TTLCache(maxsize=100, ttl=300)


class Api:
    
    ipc_address = r'\\.\pipe\macro-manager-pipe'
    
    ipc_adress_key = b"1e0dc389-f3b9-4da4-b429-0906277d7545"

    office365 = Office365()
    database = Database()
    #for terminating processes

    processes_lock = asyncio.Lock()

    processes = {}

    #handle windows left
    windows = {
        "0": "null",
        "1": "null",
        "2": "null",
        "3": "null",
        "4": "null",
        "5": "null"
    }

    #for last message querying
    processes_last_message = {}

    #for when more than 6 macros are activated at a time
    processes_queue = deque()

    #for pairs of who sends and who receives
    pairings = {}

    def get_queue_in_list(self, section_file_objects):
        try:
            filter_set = {(obj["section"], obj["file"]) for obj in section_file_objects}
            _list = [
                q for q in self.processes_queue
                if (q.get("section"), q.get("file")) in filter_set
            ]
            return json.dumps(_list)
        except:
            return json.dumps([])
    def get_queue(self):
        try:
            return json.dumps(list(self.processes_queue))
        except:
            return json.dumps([]) 
    def add_processes_queue(self, fileContent, section, file, params=None):
    

        already_exists = any(
            item["section"] == section and
            item["file"] == file
            for item in self.processes_queue
        )
        if(not already_exists):
            self.processes_queue.append({"section":section, "file":file,"fileContent":fileContent, "params":params})

    def run_next_macro_queue(self):
        macro = self.processes_queue.popleft()
        self.start_macro(macro["section"], macro["file"], macro["fileContent"], macro["params"])

        
    def are_there_macros_in_queue(self):
        if(self.processes_queue):
            return True
        return False
         
    
    def _start_transaction(self, section, file, fileContent, params=None):
        window = self.__update_windows_dict(section+file, will_use=True)
        p = multiprocessing.Process(target=run_macro_module, args=(window, fileContent, section, file, params,))
        p.start()
        return p
    


    def open_macro_output(self, id):
        data = self.database.get_macro_output(id)
        data = json.loads(data)
        data = pd.DataFrame(data)
        with tempfile.TemporaryFile(delete=False, suffix=".xlsx") as f:
            data.to_excel(f.name)
            os.startfile(f.name)
    
    def get_list_processes_in_list(self, section_file_objects):

        filter_set = {(obj["section"], obj["file"]) for obj in section_file_objects}
        
        _json = {}
        for chave, valor in self.processes.items():
            if (valor.get("section"), valor.get("file")) in filter_set:
                _json[chave] = {
                    "file": valor["file"],
                    "section": valor["section"]
                }

        return json.dumps(_json)
    
    def get_list_processes(self):
        _json = {}

        for chave, valor in self.processes.items():
            _json[chave] = {"file":valor["file"], "section":valor["section"]} 
        return json.dumps(_json)
    


    def get_processes_last_message_in_list(self, section_file_objects):
        expected_keys = {
            f"{obj['section']}{obj['file']}" for obj in section_file_objects
        }

        list = [
            {k: v}
            for k, v in self.processes_last_message.items()
            if k in expected_keys
        ]
        return json.dumps(list)
    def get_processes_last_message(self):
        try:
            return json.dumps(self.processes_last_message)
        except:
            return json.dumps({})



 
    def start_macro(self, section, file, fileContent, params=None):
        try:
            if(not self.__has_free_window()):
                self.add_processes_queue(fileContent, section, file, params)
                response = {
                "message":"macro_queued",
                }
                return json.dumps(response)
            
            child = self._start_transaction(section, file, fileContent, params)
            
            self.processes[f"{section}{file}"] = {"child":child,"file":file,"section":section}


            return json.dumps({"status":"success"})
        except:
            return json.dumps({"status":"error"})
    
      

    def stop_macro(self, section, file):
        try:
            self.__update_windows_dict(section+file)
            self.processes[f"{section}{file}"]["child"].terminate()
    
            asyncio.run(self.__delete_processes_with_lock(section+file))
        
            #more than a single place checks for this
            if self.are_there_macros_in_queue():
                self.run_next_macro_queue()


            response = {
                "status":"success",
            }
            return json.dumps(response)
        except:
            response = {
                "status":"error",
            }
            return json.dumps(response)

    async def __delete_processes_with_lock(self, client_id):
        async with self.processes_lock:
            del self.processes[client_id]
            del self.processes_last_message[client_id]


    async def __handle_connection(self, websocket):
        print("connection")
        try:
            path = websocket.request.path
            params = path.strip("/").split("/")
            

            role, section, file = params  
            client_id = section+file
            client_id = urllib.parse.unquote(client_id)
            print(role)
            if(role == "receiver"):
                self.pairings[client_id] = websocket 

            async for message in websocket:
                print(message)
                content = json.loads(message)

                msg = content["message"]

                if(msg==MACRO_EXECUTED or msg==MACRO_ERROR):
                    print(self.windows)
                    self.__update_windows_dict(client_id, will_use=False)
                    print(self.windows)
                    await self.__delete_processes_with_lock(client_id)

                    if self.are_there_macros_in_queue():
                        self.run_next_macro_queue()

                    if(msg==MACRO_EXECUTED):
                        try:
                            data = content.get("data")

                            if(data):
                                data = json.dumps(data)

                            self.database.add_macro_to_history(urllib.parse.unquote(file), data)
                        except:
                            pass  
                
                
                if role == "sender" and client_id in self.pairings:
                    print(message)


                    self.processes_last_message[client_id] = msg

                    
                    await self.pairings[client_id].send(str(msg))
                else:
                    await websocket.send("Receiver not connected")
        except:
            pass

    

    async def __ws_server(self):
        
        await websockets.serve(self.__handle_connection, "localhost", 8765)
        await asyncio.Future()            

    def run_ws_server(self):
        try:
            asyncio.run(self.__ws_server())
        except:
            pass

    def start_method_from_ipc(self, section, file, params=None):
        try:
            files = json.loads(self.get_files(section, file))
            self.start_macro(section, file, files["main.py"], params)
        except:
            pass

    def ipc_listener(self):
        try: 
            

            listener = multiprocessing.connection.Listener(self.ipc_address, authkey=self.ipc_adress_key)

            while True:
                
                #waits for a listener to connect
                conn = listener.accept()
        
                request = json.loads(conn.recv())
                method = request.get("method")
                args = request.get("args")

                getattr(self, method)(*args)


                conn.close()
                print("Client disconnected.\n")
        except Exception as e:
            print("err", e)
            pass

    def get_credentials(self):
        try:
            path = os.path.join(os.getcwd(), "modelo_default", "sap_login.txt")

            [login, password] = open(path).read().strip().split(",")
            return json.dumps({"login":login,"password":password})
        except:
            return json.dumps({"login":"","password":""})
    def update_credentials(self, login, password):
        try:
            path = os.path.join(os.getcwd(), "modelo_default", "sap_login.txt")

            f = open(path, "w")
            f.write(f"{login},{password}")
            f.close()
        except:
            pass

    def open_sap_web(self, download_dir=None, timeout=100):
        
        try:
            if download_dir is None:
                download_dir = os.path.join(Path.home(), "Downloads")

            driver = webdriver.Edge()
            driver.get("https://www.myweg.net/irj/portal?NavigationTarget=pcd:portal_content/net.weg.folder.weg/net.weg.folder"
            ".core/net.weg.folder.roles/net.weg.role.ecc/net.weg.iview.ecc")

            sap_file = None
            start_time = time.time()

            while time.time() - start_time < timeout:
                sap_files = [
                    os.path.join(download_dir, f) for f in os.listdir(download_dir) if f.endswith(".sap")
                ]
                
                if sap_files:
                    sap_file = max(sap_files, key=os.path.getctime)  # Mais recente por data de criação
                    break
                time.sleep(1)

            if sap_file is None:
                raise TimeoutError(f"Tempo limite atingido. Arquivo .sap não encontrado em {download_dir}")

            while any(
                filename.endswith((".sap.crdownload", ".sap.part")) for filename in os.listdir(download_dir)
            ):
                time.sleep(1)

            print(f"Arquivo .sap mais recente encontrado: {sap_file}")

            try:
                os.startfile(sap_file)  # Abre o arquivo usando o programa associado
                driver.close()
            except FileNotFoundError:
                print(f"Erro: Arquivo não encontrado: {sap_file}")
            except Exception as e:
                print(f"Erro ao abrir o arquivo: {e}")
        except:
            pass

    def open_sap(self):
        try:
            path = os.path.join(os.getcwd(), "modelo_default", "sap_login.txt")

            [login, password] = open(path).read().strip().split(",")

            if(not login or not password):
                self.open_sap_web()
                return

                
            path = "C:/Program Files (x86)/SAP/FrontEnd/SapGui/saplgpad.exe"
                
            subprocess.Popen(path)

            while not pyautogui.getActiveWindowTitle().startswith("SAP Logon"):
                time.sleep(1)

            sapguiauto = win32com.client.GetObject('SAPGUI')
            application = sapguiauto.GetScriptingEngine
            connection = application.OpenConnection("EP0 - ECC Produção", True)
            session = connection.Children(0)
            session.findById("wnd[0]").maximize()
            session.findById("wnd[0]/usr/txtRSYST-BNAME").Text = login
            session.findById("wnd[0]/usr/pwdRSYST-BCODE").Text = password
            session.findById("wnd[0]").sendVKey(0)
        except:
            pass
    @cached(cache)
    def get_folders(self, path=None):
        try:
            return json.dumps(self.office365.get_folders(path=path))
        except:
            return json.dumps([])
        
    def get_files(self, section, file):
        try:
            return json.dumps(self.office365.get_files(section, file))
        except:
            return json.dumps({})

    def get_folders_in_list(self, list_id):
        try:
            list = self.database.get_macros_of_list(list_id)
         

            folder_list = []
            for macro in list:
                folder_list.append({"section":macro[0], "file":macro[1]})
        
            return json.dumps(folder_list)
        
        except:
            return json.dumps([])

    
    
    def __has_free_window(self):
        for i in range(6):
            if self.windows.get(str(i)) == "null":
                return True
        return False
    
    def __update_windows_dict(self, key, will_use=False):
        if will_use:
            return self.__get_free_window(key)
        else:
            for k, v in self.windows.items():
                if v == key:
                    self.windows[k] = "null"
                    break
            return -1

    def __get_free_window(self, key):
        for i in range(6):
            i_str = str(i)
            if self.windows.get(i_str) == "null":
                self.windows[i_str] = key
                return i
        return -1



    
    

    def add_macro_to_list(self, list_id, section, file):
        try:
            path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
            file_path = f"{self.office365.get_root_path()}/{path}"

            self.database.add_macro_to_list(list_id, file_path, section, file)
            return json.dumps({"status":"success"})
        except:
            return json.dumps({"status":"error"})
    def remove_macro_of_list(self, list_id, section, file):
        try:

            path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
            file_path = f"{self.office365.get_root_path()}/{path}"

            self.database.remove_macro_of_list(list_id, file_path, section, file)
            return json.dumps({"status":"success"})
        except Exception as e:
            print(e)
            return json.dumps({"status":"error"})

    def delete_list(self, list_id):
        try:
            self.database.delete_list(list_id)
            return json.dumps({"status":"success"})
        except Exception as e:
            print(e)
            return json.dumps({"status":"error"})



    #returns all lists
    def get_lists(self):
        try:
            lists = self.database.get_lists()

            list = []
            
            for object in lists:
                list.append({"id":object[0], "name":object[1]})
                
            return json.dumps(list)
        except:
            return json.dumps([])
        
  
    #returns all lists saying if given macro is in it
    def get_lists_macro(self, section, file):
        try:
            path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
            file_path = f"{self.office365.get_root_path()}/{path}"

            macro_list_relation = self.database.get_lists_macro(file_path)

            all_lists = json.loads(self.get_lists())

            for list_ in all_lists:
                print(list_)
                list_["has_this_macro"] = False

            for register in macro_list_relation:
                result = next(obj for obj in all_lists if obj["id"] == register[0])
                if(result):
                    result["has_this_macro"] = True
            print(all_lists)
            return json.dumps(all_lists)
        except Exception as e:
            print(e)
            return json.dumps([])
    
    def create_new_list(self, name):
        try:
            self.database.create_list(name)
            return json.dumps({"status": "success"})
        except Exception as e:
            print(e)
            return json.dumps({"status": "error"})
    def get_history(self):
        try:
            history = self.database.get_macros_history()
            return json.dumps(history)
        except:
            return json.dumps([])
if __name__ == "__main__":

    multiprocessing.freeze_support() 
    multiprocessing.set_start_method("spawn")

    api = Api()
    
    ipc_thread = threading.Thread(target=api.ipc_listener, daemon=True)
    ipc_thread.start()

    ws_thread = threading.Thread(target=api.run_ws_server, daemon=True)
    ws_thread.start()

    # webview.create_window("Gerenciador De Scripts", "frontend-2/build/index.html", js_api=api, confirm_close=True)
    webview.create_window("Gerenciador De Scripts", "localhost:3000", js_api=api, confirm_close=True, maximized=True, min_size=(1450, 850))

    asyncio.run(webview.start(debug=True))
    
    




