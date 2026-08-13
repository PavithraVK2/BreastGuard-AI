import importlib, traceback, sys
try:
    importlib.import_module('server')
    print('Imported server OK')
except Exception:
    traceback.print_exc()
    sys.exit(1)
