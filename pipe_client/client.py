
import multiprocessing.connection
import json
import sys
import os

address = r'\\.\pipe\macro-manager-pipe' 

ipc_adress_key = os.getenv("pipe_key").encode()

conn = multiprocessing.connection.Client(address, authkey=ipc_adress_key)
_json = {
        
        "method":"start_method_from_ipc",
        "args":[sys.argv[1], sys.argv[2]]
        }

conn.send(json.dumps(_json))


