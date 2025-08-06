def main():
   import traceback
   import os
   from time import sleep
   import sys
   import json
   from modelo_default.sap_functions import SAP
   from modelo_default.functions import send_update
   from datetime import datetime, timedelta
   import asyncio
   params = None
   parent_folder = None
   section_parent_folder = None
   sap_window_number = 0

    

   try:
      json_param = json.loads(sys.argv[1])
      section_parent_folder = json_param["section_parent_folder"]
      parent_folder = json_param["parent_folder"]
      sap_window_number = json_param["sap_window"]
      params = json_param["params"]
   except:
      
      pass


   class Work:
      def __init__(self, sap_window, scheduled_execution, default_language, section_parent_folder, parent_folder):
         self.sap = SAP(sap_window, scheduled_execution, default_language, section_parent_folder, parent_folder)
      ######################################### FUNCTIONS HERE ########################################

      
      

   default_language = 'PT'
   scheduled_execution = {'scheduled?': False, 'username': "", 'password': "", 'principal': '100'}
   sap_window = sap_window_number

   try:
      asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":"macro_started"})))
      work = Work(sap_window, scheduled_execution, default_language, section_parent_folder, parent_folder)
      ######################################### SCRIPTS HERE ########################################

      asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":50})))
      
      asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":"macro_executed", "data":[{"dado":1, "teste":123}]})))
   except Exception as e:
      traceback.print_exc()
      asyncio.run(send_update(section_parent_folder, parent_folder, json.dumps({"message":"macro_error"})))


main()