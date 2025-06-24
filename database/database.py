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
    CREATE TABLE IF NOT EXISTS list_macros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS macro_in_list(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT
    );
    CREATE TABLE IF NOT EXISTS macro_in_list_to_list_macros(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        macro_id INTEGER,
        list_id INTEGER,
        FOREIGN KEY (macro_id) references list_macros(id),
        FOREIGN KEY (list_id) references macro_in_list(id)

    );
""")

def create_list(name):
    try:
        cur.execute("INSERT INTO list_macros(name) values(?)", (name,))
        con.commit()
        return json.dumps({"sucess":"list created"})

    except Exception as e:
        return json.dumps({"error":e})
        

def add_macro_to_list(list_id, path):
    try:
        macro_id = get_id_path(path)
        cur.execute("INSERT INTO macro_in_list_to_list_macros(macro_id, list_id) values(?, ?)", (macro_id, list_id))
        con.commit()
        return json.dumps({"success":"macro added"})
    except Exception as e:
        print(e)
        return json.dumps({"error":e})
def get_id_path(path):
    try:
        cur.execute(f"SELECT id FROM macro_in_list WHERE path = ?", (path,))
        rows = cur.fetchall()
        if rows[0]:
            return rows[0]
        else:
            cur.execute(f"INSERT INTO macro_in_list(path) values(?)", (path,))
            id = cur.lastrowid
            con.commit()
            return id
    except Exception as e:
        print(e)

def add_macro_to_history(name, data):
    time = datetime.now()
    time = time.strftime("%d/%m/%y - %H:%M:%S")
    
    try:
        cur.execute(f"INSERT INTO macros_history(name, time, data) VALUES(?, ?, ?)", (name, time, data))
        con.commit()
    except Exception as e:
        print(e)

def get_macro_output(id):
    try:
        print("id, ", str(id))
        cur.execute(f"SELECT data FROM macros_history WHERE id = (?)", (id,))
        res = cur.fetchall()
        if res:

            return res[0][0]
        return None
    except Exception as e:
        print(e)

async def get_macros_history():
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