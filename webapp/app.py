import os
import requests
from flask import Flask, render_template, jsonify, send_from_directory

app = Flask(__name__, instance_relative_config=True)

# https://exploreflask.com/en/latest/configuration.html
app.config.from_object("config.Config")

@app.route('/', methods=['GET'])
def index():
    return send_from_directory('templates','index.html')

if __name__ == '__main__':
    app.run()
