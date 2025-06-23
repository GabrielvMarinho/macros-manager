import os
from datetime import datetime, timezone
from office365.sharepoint.client_context import ClientContext
from office365.sharepoint.listitems.listitem import ListItem
from office365.runtime.auth.user_credential import UserCredential


def get_sharepoint_ctx(shrepoint_team):
    url = f"https://weg365.sharepoint.com/teams/{shrepoint_team}"
    return ClientContext(url).with_credentials(UserCredential("login", "password"))


def get_sharepoint_list(ctx, list_relative_url):
    sp_list = ctx.web.get_list(list_relative_url)
    ctx.load(sp_list)
    ctx.execute_query()
    return sp_list


def get_sharepoint_list_items(ctx, sp_list):
    items = sp_list.get_items()
    ctx.load(items)
    ctx.execute_query()
    return items


def add_sharepoint_list_item(ctx, sp_list, item_data):
    new_item = ListItem(ctx, sp_list.add_item(item_data))  # Create new item and get the ListItem object immediately
    ctx.execute_query()  # Execute the query to actually add the item
    return new_item


def download_sharepoint_file(ctx, file_url, local_path):
    file = ctx.web.get_file_by_server_relative_url(file_url)
    ctx.load(file)
    ctx.execute_query()

    with open(local_path, 'wb') as local_file:
        file = ctx.web.get_file_by_server_relative_url(file_url)
        file.download(local_file).execute_query()  # Executa a query aqui

    print(f"Arquivo baixado com sucesso para: {local_path}")


def is_sharepoint_file_newer(ctx, sharepoint_file_url, local_file_path):
    try:
        sharepoint_last_modified = get_sharepoint_file_last_modified(ctx, sharepoint_file_url)
        local_last_modified = get_local_file_last_modified(local_file_path)

        if sharepoint_last_modified is None or local_last_modified is None:
            return True

        return sharepoint_last_modified > local_last_modified

    except Exception as e:
        print(f"Error comparing file times: {e}")
        return None


def get_sharepoint_file_last_modified(ctx, file_url):
    try:
        file = ctx.web.get_file_by_server_relative_url(file_url)
        ctx.load(file)
        ctx.execute_query()
        last_modified = file.properties["TimeLastModified"]

        # Ensure it's timezone-aware (even if SharePoint sometimes returns naive datetime)
        if last_modified.tzinfo is None:
            last_modified = last_modified.replace(tzinfo=timezone.utc)  # CRUCIAL FIX
        return last_modified

    except Exception as e:
        print(f"Error retrieving last modified time: {e}")
        return None


def get_local_file_last_modified(file_path):
    try:
        timestamp = os.path.getmtime(file_path)  # Gets the timestamp as a float
        local_dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
        return local_dt

    except FileNotFoundError:
        print(f"Error: Local file not found: {file_path}")
        return None

    except Exception as e:
        print(f"Error getting local file's last modified time: {e}")
        return None

def get_folders(ctx, folder_url):
    root_folder = ctx.web.get_folder_by_server_relative_url(folder_url)
    root_folder.expand(["Folders"]).get().execute_query()

    folders = root_folder.folders

    folder_list = []

    for folder in folders:
        folder_list.append(folder)
        
    return folder_list


def get_files(ctx, folder_url):
    pass
# SISTEMA PARA PEGAR TODAS OS ARQUIVOS DE UMA PASSTA NO SHAREPOINT 365
def download_items(ctx, folder_url, local_path):
    #creating folder
    os.makedirs(local_path, exist_ok=True)
    libraryRoot = ctx.web.get_folder_by_server_relative_url(folder_url)
    ctx.load(libraryRoot)
    ctx.execute_query()

    # FOLDERS SYSTEM
    folders = libraryRoot.folders
    ctx.load(folders)
    ctx.execute_query()
    for myfolder in folders:
        local_subfolder_path = os.path.join(local_path, myfolder.properties["Name"])
        # creating subfolders
        os.makedirs(local_subfolder_path, exist_ok=True)
        download_items(ctx, myfolder.properties["ServerRelativeUrl"], local_subfolder_path)

        print("Folder name: {0}".format(myfolder.properties["ServerRelativeUrl"]))
    # FILES SYSTEM
    files = libraryRoot.files
    ctx.load(files)
    ctx.execute_query()

    for myfile in files:
        local_file_path = os.path.join(local_path, myfile.properties["Name"])
        if is_sharepoint_file_newer(ctx, myfile.properties['ServerRelativeUrl'], local_file_path):
            print(f"Downloading file: {myfile.properties['ServerRelativeUrl']} to {local_file_path}")
            # download files of folder
            with open(local_file_path, 'wb') as local_file:
                myfile.download(local_file).execute_query()


