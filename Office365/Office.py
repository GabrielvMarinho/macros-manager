from dotenv import load_dotenv
import os
from datetime import datetime, timezone
from office365.sharepoint.client_context import ClientContext
from office365.sharepoint.listitems.listitem import ListItem
from office365.runtime.auth.user_credential import UserCredential
import json
import urllib

class Office365:
    
    ROOT_PATH_SHAREPOINT = "Shared%20Documents/Departamento%20PCP/Gerenciador%20de%20Scripts/Macros"

    def get_sharepoint_ctx(self, shrepoint_team):
        url = f"https://weg365.sharepoint.com/teams/{shrepoint_team}"
        load_dotenv()
        return ClientContext(url).with_credentials(UserCredential(os.getenv("SHAREPOINT_API_LOGIN"), os.getenv("SHAREPOINT_API_KEY")))

    def get_folders(self, path=None):
        cntx = self.get_sharepoint_ctx("BR-WEN-IND-PLANPRODUCAO")

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

    def get_files(self, section, file):
        cntx = self.get_sharepoint_ctx("BR-WEN-IND-PLANPRODUCAO")
        path = urllib.parse.quote(section)+"/"+urllib.parse.quote(file)
        file_path = f"{self.ROOT_PATH_SHAREPOINT}/{path}"

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
    def get_root_path(self):
        return self.ROOT_PATH_SHAREPOINT
