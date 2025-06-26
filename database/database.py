import sqlite3
from datetime import datetime
import json
        
con = sqlite3.connect("database/database.db", check_same_thread=False)

cur = con.cursor()

cur.executescript("""
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

async def db_get_lists_macro(path):
    try:
        cur.execute("""
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
        res = cur.fetchall()
        
        return json.dumps({"success":{"message":res}})

    except Exception as e:
        return json.dumps({"error":{"message":e}})
    

async def db_get_lists():
    cur.execute("""
                    SELECT 
                        lists.id,
                        lists.name
                    FROM lists
                    """)
    res = cur.fetchall()
    return json.dumps({"lists":res})

async def db_get_macros_of_list(list_id):
    cur.execute("""
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
    res = cur.fetchall()
    return json.dumps({"lists":res})
    
async def db_create_list(name):
    cur.execute("INSERT INTO lists(name) values(?)", (name,))
    con.commit()
    return json.dumps({"success":"list created"})

        
async def db_remove_macro_of_list(list_id, path, section, file):
    macro_id = db_get_id_path(path, section, file)
    cur.execute("DELETE FROM macros_path_to_list WHERE macro_id = ? AND list_id = ?", (macro_id, list_id))
    con.commit()
    return json.dumps({"success":"macro added"})

async def db_add_macro_to_list(list_id, path, section, file):
    macro_id = db_get_id_path(path, section, file)
    cur.execute("INSERT INTO macros_path_to_list(macro_id, list_id) values(?, ?)", (macro_id, list_id))
    con.commit()
    return json.dumps({"success":"macro added"})
  
def db_get_id_path(path, section, file):
    try:
        cur.execute(f"SELECT id FROM macros_path WHERE path = ?", (path,))
        rows = cur.fetchall()
        if rows:
            return rows[0][0]
        else:
            cur.execute(f"INSERT INTO macros_path(path, section, folder) values(?, ?, ?)", (path, section, file))
            id = cur.lastrowid
            con.commit()
            return id
    except Exception as e:
        print(e)

def db_add_macro_to_history(name, data):
    time = datetime.now()
    time = time.strftime("%d/%m/%y - %H:%M:%S")
    
    try:
        cur.execute(f"INSERT INTO macros_history(name, time, data) VALUES(?, ?, ?)", (name, time, data))
        con.commit()
    except Exception as e:
        print(e)

def db_get_macro_output(id):
    try:
        print("id, ", str(id))
        cur.execute(f"SELECT data FROM macros_history WHERE id = (?)", (id,))
        res = cur.fetchall()
        if res:

            return res[0][0]
        return None
    except Exception as e:
        print(e)

async def db_get_macros_history():
    try:
        cur.execute("SELECT * FROM macros_history")
        rows = cur.fetchall()
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