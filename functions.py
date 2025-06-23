def update_windows_dict(windows_dict, key, vai_usar=False):
    if vai_usar:
        return get_free_window(windows_dict, key)
    else:
        for k, v in windows_dict.items():
            if v == key:
                windows_dict[k] = "null"
                break
        return -1

def get_free_window(windows_dict, key):
    for i in range(6):
        i_str = str(i)
        if windows_dict.get(i_str) == "null":
            windows_dict[i_str] = key
            return i
    return -1