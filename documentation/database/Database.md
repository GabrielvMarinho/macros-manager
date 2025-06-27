**Class to manage database connection and querying**

## ATTRIBUTES
### **con**
the connection to the database sqlite file
### **cur**
cursor of the connection

## METHODS
### **get_lists_macro(self, path)**
Return each list + information about a macro in int 
### **get_lists(self)**
Return all the lists
### **get_macros_of_list(self, list_id)**
Return all macros in a given lists
### **create_list(self, name)**
Create a new list
### **remove_macro_of_list(self, list_id, path, section, file)**
Remove macro from a given lists
### **add_macro_to_list(self, list_id, path, section, file)**
Add macro to a given list
### **delete_list(self, list_id)**
Delete given list
### **get_id_path(self, path, section, file)**
Get the id of a macro with certain path, if doesn't, create one
### **add_macro_to_history(self, name, data)**
Add macro to history
### **get_macro_output(self, id)**
Get the output in a macro history
### **get_macros_history(self)**
Get the history of all macros