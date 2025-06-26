import win32com.client
import threading
import websockets
import asyncio
import office_api.office365_api as office365_api
from datetime import datetime
from database.database import *
import json
import webview

import pandas as pd
import tempfile

from collections import deque
from collections import Counter
import os
import json
from time import sleep

import multiprocessing
import importlib
import urllib.parse

from pathlib import Path
from selenium import webdriver


#external imports
import sys
from tkinter import messagebox
import re
import os
import time
import subprocess
import pyautogui
import io

MACRO_EXECUTED = "macro_executed"
MACRO_ERROR = "macro_error"
ROOT_PATH_SHAREPOINT = "Shared%20Documents/Departamento%20PCP/Gerenciador%20de%20Scripts/Macros"

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

        




class Api:
    #for terminating processes
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
        filter_set = {(obj["section"], obj["file"]) for obj in section_file_objects}

        list = [
            q for q in self.processes_queue
            if (q.get("section"), q.get("file")) in filter_set
        ]
        return json.dumps({"queue":list})
    def get_queue(self):
        return json.dumps({"queue":list(self.processes_queue)})
    
    def add_processes_queue(self, fileContent, section, file, params=None):
        self.processes_queue.append({"section":section, "file":file,"fileContent":fileContent, "params":params})
        pass

    def run_next_macro_queue(self):
        macro = self.processes_queue.popleft()
        self.start_macro(macro["section"], macro["file"], macro["fileContent"], macro["params"])

        
    def are_there_macros_in_queue(self):
        if(self.processes_queue):
            return True
        return False

    def kill_all_processes(self):
        self.clean_windows()

        for chave, valor in self.processes.items():

            valor.terminate()
            
        self.processes = {}

        response= {
            "message":"macros killed"
        }
        

        
        return response
         
    
    def _start_transaction(self, section, file, fileContent, params=None):
        window = self.update_windows_dict(section+file, will_use=True)
        p = multiprocessing.Process(target=run_macro_module, args=(window, fileContent, section, file, params,))
        p.start()
        return p
    
    def get_sections(self):
        sections_path = os.path.join(os.getcwd(), "modelo_default", "macros")
        sections = os.listdir(sections_path)

        response = {
            "sections":sections,
        }
        return json.dumps(response)
    


    def open_macro_output(self, id):
        data = db_get_macro_output(id)
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
        return json.dumps(self.processes_last_message)
    



 
    def start_macro(self, section, file, fileContent, params=None):
        if(not self.has_free_window()):
            self.add_processes_queue(fileContent, section, file, params)
            response = {
            "message":"macro_queued",
            }
            return json.dumps(response)

        child = self._start_transaction(section, file, fileContent, params)
        
        self.processes[f"{section}{file}"] = {"child":child,"file":file,"section":section}

        response = {
            "message":"macro_started",
        }

        return json.dumps(response)

    def stop_macro(self, section, file):
        self.update_windows_dict(section+file)
        self.processes[f"{section}{file}"]["child"].terminate()
        try:
            del self.processes[section+file]
            del self.processes_last_message[f"{section}{file}"]
        except Exception as e:
            pass
        #more than a single place checks for this
        if self.are_there_macros_in_queue():
            self.run_next_macro_queue()


        response = {
            "message":"Thread Stopped",
        }
        return json.dumps(response)

    async def handle_connection(self, websocket):
        path = websocket.request.path
        params = path.strip("/").split("/")

        role, section, file = params  
        client_id = section+file
        client_id = urllib.parse.unquote(client_id)

        if(role == "receiver"):
            self.pairings[client_id] = websocket 

        try:
            async for message in websocket:
                if role == "sender":
                    if client_id in self.pairings:
                        content = json.loads(message)

                        msg = content["message"]
                        
                        self.processes_last_message[client_id] = msg
                        await self.pairings[client_id].send(str(msg))

                        if(msg==MACRO_EXECUTED or msg==MACRO_ERROR):

                            self.update_windows_dict(client_id, will_use=False)

                            del self.processes_last_message[client_id]
                            del self.processes[client_id]
                           
                            if self.are_there_macros_in_queue():
                                self.run_next_macro_queue()
                            if(msg==MACRO_EXECUTED):
                                try:
                                    data = content.get("data")

                                    if(data):
                                        data = json.dumps(data)
                             
                                    db_add_macro_to_history(urllib.parse.unquote(file), data)
                                except:
                                    pass
                                
                                

                            
                            
                    else:
                        await websocket.send("Receiver not connected")
        except:
            pass

    async def ws_server(self):
        await websockets.serve(self.handle_connection, "localhost", 8765)
        await asyncio.Future()            

    def run_ws_server(self):
        asyncio.run(self.ws_server())

    def clean_windows(self):
        self.windows = {
            "0": "null",
            "1": "null",
            "2": "null",
            "3": "null",
            "4": "null",
            "5": "null"
        }

    def get_credentials(self):
        path = os.path.join(os.getcwd(), "modelo_default", "sap_login.txt")

        [login, password] = open(path).read().strip().split(",")
        return json.dumps({login:password})
    
    def update_credentials(self, login, password):
        path = os.path.join(os.getcwd(), "modelo_default", "sap_login.txt")

        f = open(path, "w")
        f.write(f"{login},{password}")
        f.close()
        pass

    def open_sap_web(self, download_dir=None, timeout=100):
        
        
        if download_dir is None:
            download_dir = os.path.join(Path.home(), "Downloads")

        

        driver = webdriver.Edge()
        driver.get("https://www.myweg.net/irj/portal?NavigationTarget=pcd:portal_content/net.weg.folder.weg/net.weg.folder"
           ".core/net.weg.folder.roles/net.weg.role.ecc/net.weg.iview.ecc")

        sap_file = None
        start_time = time.time()

        while time.time() - start_time < timeout:
            # Encontra o arquivo .sap mais recente
            sap_files = [
                os.path.join(download_dir, f) for f in os.listdir(download_dir) if f.endswith(".sap")
            ]
            
            if sap_files:
                sap_file = max(sap_files, key=os.path.getctime)  # Mais recente por data de criação
                break
            time.sleep(1)

        if sap_file is None:
            raise TimeoutError(f"Tempo limite atingido. Arquivo .sap não encontrado em {download_dir}")

        # Aguarda downloads incompletos (ex: .crdownload, .part)
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

    def open_sap(self):
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
    #get the folders in a list
    def get_folders_in_list(self, list_id):
        try:
            res = asyncio.run(db_get_macros_of_list(list_id))
            res = json.loads(res)

            folder_list = []
            for macro in res["lists"]:
                folder_list.append({"section":macro[0], "file":macro[1]})
            data = {
                "folders":folder_list
            }
            return json.dumps(data)
        
        except Exception as e:
            print(e)
            pass
    def get_folders(self, path=None):
        cntx = office365_api.get_sharepoint_ctx("BR-WEN-IND-PLANPRODUCAO")

        folder_path = "Shared%20Documents/Departamento%20PCP/Gerenciador%20de%20Scripts/Macros"
        if(path != None):
            folder_path = f"Shared%20Documents/Departamento%20PCP/Gerenciador%20de%20Scripts/Macros/{path}"
        
        root_folder = cntx.web.get_folder_by_server_relative_url(folder_path)

        root_folder.expand(["Folders"]).get().execute_query()

        folders = root_folder.folders

        folder_list = []

        for folder in folders:
            folder_list.append(folder.name)
        data = {
            "folders":folder_list
        }
        return json.dumps(data)
    
    def has_free_window(self):
        for i in range(6):
            if self.windows.get(str(i)) == "null":
                return True
        return False
    
    def update_windows_dict(self, key, will_use=False):
        if will_use:
            return self.get_free_window(key)
        else:
            for k, v in self.windows.items():
                if v == key:
                    self.windows[k] = "null"
                    break
            return -1

    def get_free_window(self, key):
        for i in range(6):
            i_str = str(i)
            if self.windows.get(i_str) == "null":
                self.windows[i_str] = key
                return i
        return -1



    def get_files(self, section, file):
        cntx = office365_api.get_sharepoint_ctx("BR-WEN-IND-PLANPRODUCAO")
        path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
        file_path = f"{ROOT_PATH_SHAREPOINT}/{path}"

        root_folder = cntx.web.get_folder_by_server_relative_url(file_path)

        root_folder.expand(["Files"]).get().execute_query()

        files = root_folder.files

        data = {}
        for file_ in files:
            if(file_.name[-5:]==".json"):
                data[file_.name] = json.loads(file_.read().decode("utf-8"))
            else:
                data[file_.name] = file_.read().decode("utf-8")
        return json.dumps(data)
    

    def add_macro_to_list(self, list_id, section, file):
        try:
            path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
            file_path = f"{ROOT_PATH_SHAREPOINT}/{path}"

            asyncio.run(db_add_macro_to_list(list_id, file_path, section, file))
            return json.dumps({"status":"success"})
        except Exception as e:
            print(e)
            return json.dumps({"status":"error"})
    def remove_macro_of_list(seld, list_id, section, file):
        try:

            path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
            file_path = f"{ROOT_PATH_SHAREPOINT}/{path}"

            asyncio.run(db_remove_macro_of_list(list_id, file_path, section, file))
            return json.dumps({"status":"success"})
        except Exception as e:
            print(e)
            return json.dumps({"status":"error"})






    #returns all lists
    def get_lists(self):
        try:
            res = asyncio.run(db_get_lists())
            res = json.loads(res)
            list = []
            
            for object in res["lists"]:
                list.append({"id":object[0], "name":object[1]})
                
            return json.dumps(list)
        except Exception as e:
            print(e)
            return json.dumps([])
        
    #returns a single lists with all macros in it
    def get_lists_macros(self, list_id):
        try:
            res = asyncio.run(db_get_lists())
            res = json.loads(res)
            list = []
            
            for object in res["lists"]:
                list.append({"id":object[0], "name":object[1]})
            return list
        except:
            return {}
        
    #returns all lists saying if given macro is in it
    def get_lists_macro(self, section, file):
        path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
        file_path = f"{ROOT_PATH_SHAREPOINT}/{path}"

        res = asyncio.run(db_get_lists_macro(file_path)) 
        macro_list_relation = json.loads(res)

        all_lists = json.loads(self.get_lists())
        
        for list_ in all_lists:
            list_["has_this_macro"] = False

        if macro_list_relation["success"]:
            for register in macro_list_relation["success"]["message"]:
                result = next(obj for obj in all_lists if obj["id"] == register[0])
                if(result):
                    result["has_this_macro"] = True
            return json.dumps(all_lists)
        else:
            print(res["error"]["message"])
        
    
    def create_new_list(self):
        res = asyncio.run(db_create_list())
        res = json.loads(res)
        if res.success:
            json.dumps({"message":"success"})
        else:
            if(res.error.sqlite_errorname == "SQLITE_CONSTRAINT_UNIQUE"):
                return json.dumps({"message":"duplicate_name"})
            else:
                return json.dumps({"message":"error"})
        pass
    def get_history(self):
        res = asyncio.run(db_get_macros_history())
        res = {"history":res}
        return json.dumps(res)

if __name__ == "__main__":
    multiprocessing.freeze_support() 
    multiprocessing.set_start_method("spawn")

    api = Api()
    ws_thread = threading.Thread(target=api.run_ws_server, daemon=True)
    ws_thread.start()
    api.add_macro_to_list(1, "Programação", "fran")

    # webview.create_window("Gerenciador De Scripts", "frontend-2/build/index.html", js_api=api, confirm_close=True)
    webview.create_window("Gerenciador De Scripts", "localhost:3000", js_api=api, confirm_close=True, maximized=True, min_size=(1450, 850))

    asyncio.run(webview.start(debug=True))
    
    




