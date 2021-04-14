"""Flask configuration."""
import re
from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))

class Default:
    """Base config."""
    SECRET_KEY = environ.get('SECRET_KEY','This secret must change')
    SESSION_COOKIE_NAME = environ.get('SESSION_COOKIE_NAME','flask-cookie-session-name')
    COINMARKETCAP_API_KEY = environ.get('COINMARKETCAP_API_KEY')
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'
    TESTING = True
    DEBUG = True
    FLASK_ENV = 'development'

class Production(Default):
    TESTING = False
    DEBUG = False
    FLASK_ENV = 'production'

class Staging(Default):
    FLASK_ENV = 'production'

Config = Default
if environ.get('FLASK_CONFIG') == 'production':
    Config = Production
elif environ.get('FLASK_CONFIG') == 'staging':
    Config = Staging
