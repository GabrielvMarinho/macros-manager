import sqlite3
from datetime import datetime

        
con = sqlite3.connect("database/database.db", check_same_thread=False)

cur = con.cursor()

cur.execute("""
    CREATE TABLE IF NOT EXISTS macros_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        time TEXT,
        data TEXT


    )
""")

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

def get_macros_history():
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