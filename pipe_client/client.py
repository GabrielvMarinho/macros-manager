
import multiprocessing.connection
import json
import sys
import os

address = r'\\.\pipe\macro-manager-pipe' 

ipc_adress_key = b"1e0dc389-f3b9-4da4-b429-0906277d7545"

conn = multiprocessing.connection.Client(address, authkey=ipc_adress_key)
_json = {
        
        "method":"start_method_from_ipc",
        "args":[sys.argv[1], sys.argv[2]]
        }

conn.send(json.dumps(_json))


