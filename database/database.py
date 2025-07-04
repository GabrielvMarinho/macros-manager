import sqlite3
from datetime import datetime
import json
        

class Database:
    con = sqlite3.connect("database/database.db", check_same_thread=False)

    cur = con.cursor()

    def __init__(self):
        
        self.cur.executescript("""
            CREATE TABLE IF NOT EXISTS macros_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                time TEXT,
                data TEXT
            );
            CREATE TABLE IF NOT EXISTS lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE
            );
            
            CREATE TABLE IF NOT EXISTS macros_path(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                path TEXT,
                section TEXT,
                folder TEXT
            );
            CREATE TABLE IF NOT EXISTS macros_path_to_list(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                macro_id INTEGER,
                list_id INTEGER,
                UNIQUE (macro_id, list_id),
                FOREIGN KEY (macro_id) references macros_path(id),
                FOREIGN KEY (list_id) references lists(id)
            );
        """)
    def get_lists_macro(self, path):
        self.cur.execute("""
                    SELECT 
                        lists.id,
                        lists.name,
                        macros_path.id,
                        macros_path.path
                    FROM lists 
                    INNER JOIN macros_path_to_list
                        ON macros_path_to_list.list_id = lists.id
                    INNER JOIN macros_path 
                        ON macros_path_to_list.macro_id = macros_path.id 
                    WHERE macros_path.path = (?) 

                         

                    """, (path,))
        return self.cur.fetchall() 
        

    def get_lists(self):
        self.cur.execute("""
                        SELECT 
                            lists.id,
                            lists.name
                        FROM lists
                        """)
        return self.cur.fetchall()

    def get_macros_of_list(self, list_id):
        self.cur.execute("""
                        SELECT 
                            macros_path.section,
                            macros_path.folder
                        FROM lists 
                        INNER JOIN macros_path_to_list
                            ON macros_path_to_list.list_id = lists.id
                        INNER JOIN macros_path 
                            ON macros_path_to_list.macro_id = macros_path.id 
                        WHERE lists.id = ?

                        """, (list_id,))
        return self.cur.fetchall()
        
    def create_list(self, name):
        self.cur.execute("INSERT INTO lists(name) values(?)", (name,))
        self.con.commit()
        return json.dumps({"success":"list created"})

            
    def remove_macro_of_list(self, list_id, path, section, file):
        macro_id = self.get_id_path(path, section, file)
        self.cur.execute("DELETE FROM macros_path_to_list WHERE macro_id = ? AND list_id = ?", (macro_id, list_id))
        self.con.commit()
        return json.dumps({"success":"macro added"})

    def add_macro_to_list(self, list_id, path, section, file):
        macro_id = self.get_id_path(path, section, file)
        self.cur.execute("INSERT INTO macros_path_to_list(macro_id, list_id) values(?, ?)", (macro_id, list_id))
        self.con.commit()
        return json.dumps({"success":"macro added"})

    def delete_list(self, list_id):
        self.cur.execute("DELETE FROM macros_path_to_list WHERE list_id = ?", (list_id,))
        self.cur.execute("DELETE FROM lists WHERE id = ?", (list_id,))
        self.con.commit()
        
    def get_id_path(self, path, section, file):
        try:
            self.cur.execute(f"SELECT id FROM macros_path WHERE path = ?", (path,))
            rows = self.cur.fetchall()
            if rows:
                return rows[0][0]
            else:
                self.cur.execute(f"INSERT INTO macros_path(path, section, folder) values(?, ?, ?)", (path, section, file))
                id = self.cur.lastrowid
                self.con.commit()
                return id
        except Exception as e:
            print(e)

    def add_macro_to_history(self, name, data):
        time = datetime.now()
        time = time.strftime("%d/%m/%y - %H:%M:%S")
        
        try:
            self.cur.execute(f"INSERT INTO macros_history(name, time, data) VALUES(?, ?, ?)", (name, time, data))
            self.con.commit()
        except Exception as e:
            print(e)

    def get_macro_output(self, id):
        try:
            print("id, ", str(id))
            self.cur.execute(f"SELECT data FROM macros_history WHERE id = (?)", (id,))
            res = self.cur.fetchall()
            if res:

                return res[0][0]
            return None
        except Exception as e:
            print(e)

    async def get_macros_history(self):
        try:
            self.cur.execute("SELECT * FROM macros_history")
            rows = self.cur.fetchall()
            result = []

            for row in rows:
                id_, name, time, output = row
                has_output = output is not None
                result.append({
                    "id": id_,
                    "name": name,
                    "time": time,
                    "has_output": has_output
                })

            return result
        except Exception as e:
            print(e)