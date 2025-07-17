def main():
    import os
    import sys
    import json
    from modelo_default.sap_functions import SAP
    from modelo_default.functions import send_update
    import asyncio
    params = None
    parent_folder = None
    section_parent_folder = None
    login = None
    password = None


    json_param = json.loads(sys.argv[1])
    section_parent_folder = json_param["section_parent_folder"]
    parent_folder = json_param["parent_folder"]
    sap_window_number = json_param["sap_window"]


    try:
        params = json_param["params"]
        login = json_param["login"]
        password = json_param["password"]
    except:
        pass


    class Work:
        def __init__(self, sap_window, scheduled_execution, default_language, section_parent_folder, parent_folder):
            self.sap = SAP(sap_window, scheduled_execution, default_language, section_parent_folder, parent_folder)


    default_language = 'PT'
    scheduled_execution = {'scheduled?': False, 'username': login, 'password': password, 'principal': '100'}
    sap_window = sap_window_number


    try:
        
        # message to show that its was started
        asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":"macro_started"})))

        work = Work(sap_window, scheduled_execution, default_language, section_parent_folder, parent_folder)
        

        row = 0
        max_row = 200
        while row<max_row:
          
            work.sap.select_transaction("md4c")

            # message to show the progress bar update
            asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":row/max_row*100})))
            row = row+1

        # message to show that its was finished
        asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":"macro_executed", "data":[{"dado":1, "teste":123}]})))
    except Exception as e:
        asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":"macro_error"})))


main()