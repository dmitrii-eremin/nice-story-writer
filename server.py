from flask import Flask, request, json
from flask_cors import CORS
import os

api = Flask(__name__)
CORS(api)


DATA_FOLDER = "notes"


@api.route('/notes', methods=['GET'])
def get_notes():
    f = []
    for (dirpath, dirnames, filenames) in os.walk(DATA_FOLDER):
        f.extend(filenames)
        break

    output = {
        "version": 1,
        "files": f
    }
    return json.dumps(output)


@api.route('/note', methods=['GET'])
def get_note():
    filename = request.args.get("filename")
    fullpath = os.path.join(DATA_FOLDER, filename)

    text = ""
    with open(fullpath) as f:
        text = f.read()

    output = {
        "version": 1,
        "text": text
    }
    return json.dumps(output)


@api.route('/note', methods=['POST'])
def post_note():
    filename = request.json["filename"]
    text = request.json["text"]

    fullpath = os.path.join(DATA_FOLDER, filename)

    with open(fullpath, "w") as f:
        f.write(text)

    output = {
        "version": 1,
        "success": True
    }
    return json.dumps(output)


@api.route('/note', methods=['DELETE'])
def delete_note():
    filename = request.json["filename"]
    fullpath = os.path.join(DATA_FOLDER, filename)

    if os.path.exists(fullpath):
        os.remove(fullpath)

    output = {
        "version": 1,
        "success": True
    }
    return json.dumps(output)


if __name__ == '__main__':
    api.run()
