"""Gunicorn prod config file"""

# Django WSGI application path in pattern MODULE_NAME:VARIABLE_NAME
wsgi_app = "core.asgi:application"

# The granularity of Error log outputs
loglevel = "info"

# The number of worker processes for handling requests
workers = 1

# The socket to bind
#bind = "/run/gunicorn.sock"
bind = "0.0.0.0:8010"

# Don't restart workers when code changes (development only!)
reload = False

# Write access and error info to /var/log
accesslog = errorlog = "var/log/prod.log"

# Redirect stdout/stderr to log file
capture_output = True

# PID file so you can easily fetch process ID
pidfile = "var/run/prod.pid"

# Daemonize the Gunicorn process (detach & enter background)
daemon = True

# ASGI Uvicorn worker class (instead of WSGI)
worker_class = "uvicorn.workers.UvicornWorker"
