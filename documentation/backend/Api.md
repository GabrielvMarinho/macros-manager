
**Class that will be referentiated by the frontend**

## ATTRIBUTES

### **database**
class responsible for data managing in the database 

### **processes**
Manages all the processes currently happening
**Structure**: object of {section+file:subprocess} 

### **windows**
Manages all the open windows, each process takes one window\
**Structure**: windows = {"0": "null","1": "null","2": "null","3": "null","4": "null","5": "null"}

### **processes_last_message**
Manages the last_message of each macro so the loading bar is not null in case he start the connection between steps\
**Structure**: object of {section+file:message}

### **processes_queue**
Manages the macros that didn't have a free window to run | follows FIFO\
**Structure**: list of {"section":section, "file":file,"fileContent":fileContent, "params":params}

### **pairings**
Manages the websocket connections\
**Structure**: object of {section+file:websocket_path}

## METHODS
### **get_queue(self)**
Return the queues
### **get_queue_in_list(self, section_file_objects)**
Return the queues where there is a queue with same section and file as section_file_objects
### **add_processes_queue(self, fileContent, section, file, params=None)**
Append a new object queue in processes_queue
### **run_next_macro_queue(self)**
Gets the left queue in the deque and run it
### **are_there_macros_in_queue(self)**
Check to see if there at leat one register in queue
### **_start_transaction(self, section, file, fileContent, params=None)**
Start a new process calling run_macro_module()
### **run_macro_module(sap_window, fileContent, section, file, params=None)**
Start executing the content of fileContent with the function exec()
### **open_macro_output(self, id)**
Open a temporary file with the output of given macro
### **get_list_processes(self)**
Return objects with file and section
### **get_list_processes_in_list(self, section_file_objects)**
Return objects with file and section where there is a process with same section and file as section_file_objects
### **get_processes_last_message(self)**
Return the processes_last_message
### **get_processes_last_message_in_list(self, section_file_objects)**
Return the processes_last_message where there is a last message with same section and file as section_file_objects
### **start_macro(self, section, file, fileContent, params=None)**
Check for free windows, if free it start the macro with _start_transaction(), otherwise will call add_processes_queue() to add to queue
### **has_free_window(self)**
Checks for free window
### **stop_macro(self, section, file)**
Update windows with update_windows_dict(), terminate the process, delete from the processes attribute. If macros in queue run, the macro in queue. 
### **handle_connection(self, websocket)** *(async)*
Manages the messages. saves the pairings, pass the message to the client (only per connection).
This method checks for executed macros or error in macros and doing something about it:
example: if a macro stops, checks for the queue and run if something in it
### **ws_server(self)** *(async)*
Defines websocket server in localhost 8765
### **run_ws_server(self)**
Starts websocket server
### **get_credentials(self)**
Return the credentials from sap_login.txt
### **update_credentials(self, login, password)**
Update the credentials from sap_login.txt
### **open_sap(self)**
Tries opening sap with credentials, if not found, calls open_sap_web
### **open_sap_web(self, download_dir=None, timeout=100)**
Open sap web
### **get_folders(self, path=None)**
Uses office365_api to get the folders from a specific path
### **get_folders_in_list(self, list_id)**
Return the folders (macros) in a list from sqlite
### **update_windows_dict(self, key, will_use=False)**
Update the windows structure either for making a position empty or used
### **get_free_window(self, key)**
Return the index of the free window
### **get_files(self, section, file)**
Return the files of a specific folder in sharepoint (if a macro, [inputs.json, data.json, main.py])
### **add_macro_to_list(self, list_id, section, file)**
Add macro to list in the database
### **remove_macro_of_list(self, list_id, section, file)**
Remove macro from specific list in the database
### **delete_list(self, list_id)**
Delete list entirely in the database
### **get_lists(self)**
Return all the lists in the database
### **get_lists_macro(self, section, file)**
Return all the lists in the database with an attribute saying if given macro is in it
### **create_new_list(self, name)**
Create new list in the database
### **get_history(self)**
get the history of executed macros in the database