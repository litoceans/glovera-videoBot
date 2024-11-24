import time
from .generator import encrypt

def flatten_object(obj, parent_key='', sep='_'):
    items = []
    for k, v in obj.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_object(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            for i, elem in enumerate(v):
                list_key = f"{new_key}{sep}{i}"
                if isinstance(elem, dict):
                    items.extend(flatten_object(elem, list_key, sep=sep).items())
                else:
                    items.append((list_key, elem))
        else:
            items.append((new_key, v))
    return dict(items)