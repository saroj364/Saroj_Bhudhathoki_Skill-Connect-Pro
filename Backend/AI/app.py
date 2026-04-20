from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import base64
import uuid
import os
import speech_recognition as sr
from interface import predict_keyword

app = Flask(__name__)
CORS(app)

recognizer = sr.Recognizer()

VALID_KEYWORDS = {
    "javascript",
    "function",
    "object",
    "api",
    "database",
    "json",
    "async",
    "node",
    "express",
    "authentication",
    "jwt",
    "microservices",
    "caching",
    "scalability",
    "architecture",
    "class",
    "components",
    "state",
    "props",
    "hooks",
    "routing",
    "deployment",
    "docker",
    "containers",
    "cloud",
    "monitoring",
    "automation",
    "security",
    "sql",
    "vulnerabilities",
    "penetration",
    "encryption",
    "exploits",
    "mongodb",
    "schema",
    "collections",
    "indexing",
    "queries",
    "aggregation",
    "nosql"
}

DESCRIPTIONS = {
    "javascript": "JavaScript is a programming language used to build dynamic web applications.",
    "function": "A function is a reusable block of code that performs a specific task.",
    "object": "An object is a collection of key-value pairs used to store data.",
    "api": "API enables communication between different software systems.",
    "database": "A database stores and manages structured or unstructured data.",
    "json": "JSON is a lightweight format for storing and exchanging data.",
    "async": "Async programming allows tasks to run without blocking execution.",
    "node": "Node.js is a runtime environment for executing JavaScript on the server.",
    "express": "Express is a web framework for building APIs in Node.js.",
    "authentication": "Authentication verifies the identity of a user.",
    "jwt": "JWT is a token-based authentication method used for secure communication.",
    "microservices": "Microservices architecture splits applications into smaller independent services.",
    "caching": "Caching stores data temporarily to improve performance.",
    "scalability": "Scalability refers to handling increased load efficiently.",
    "architecture": "Architecture defines the structure and design of a system.",
    "class": "A class is a blueprint for creating objects in programming.",
    "components": "Components are reusable UI building blocks in frameworks like React.",
    "state": "State represents dynamic data in a component.",
    "props": "Props are inputs passed to components in React.",
    "hooks": "Hooks allow using state and lifecycle features in functional components.",
    "routing": "Routing manages navigation between different pages in an application.",
    "deployment": "Deployment is the process of releasing an application to production.",
    "docker": "Docker is used to create and manage containers.",
    "containers": "Containers package applications with their dependencies.",
    "cloud": "Cloud computing provides on-demand computing resources over the internet.",
    "monitoring": "Monitoring tracks system performance and health.",
    "automation": "Automation reduces manual effort by using scripts or tools.",
    "security": "Security protects systems from attacks and vulnerabilities.",
    "sql": "SQL is used to query and manage relational databases.",
    "vulnerabilities": "Vulnerabilities are weaknesses that can be exploited in a system.",
    "penetration": "Penetration testing simulates attacks to find security flaws.",
    "encryption": "Encryption secures data by converting it into unreadable form.",
    "exploits": "Exploits take advantage of vulnerabilities in systems.",
    "mongodb": "MongoDB is a NoSQL database that stores data in JSON-like format.",
    "schema": "Schema defines the structure of data in a database.",
    "collections": "Collections are groups of documents in MongoDB.",
    "indexing": "Indexing improves database query performance.",
    "queries": "Queries are used to retrieve data from a database.",
    "aggregation": "Aggregation processes data and returns computed results.",
    "nosql": "NoSQL databases store data in flexible, non-relational formats."
}
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)


def convert_to_wav(input_path, output_path):
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        "-sample_fmt", "s16",
        output_path
    ]

    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return result.returncode == 0 and os.path.exists(output_path)


def cleanup(*files):
    for f in files:
        try:
            if f and os.path.exists(f):
                os.remove(f)
        except:
            pass


@app.route("/audio-stream", methods=["POST"])
def audio_stream():
    webm_path = None
    wav_path = None

    try:
        data = request.get_json(force=True)
        audio_b64 = data.get("audio")

        if not audio_b64:
            return "", 204

        file_id = str(uuid.uuid4())
        webm_path = os.path.join(TEMP_DIR, f"{file_id}.webm")
        wav_path = os.path.join(TEMP_DIR, f"{file_id}.wav")

        audio_bytes = base64.b64decode(audio_b64)

        with open(webm_path, "wb") as f:
            f.write(audio_bytes)

        if not convert_to_wav(webm_path, wav_path):
            cleanup(webm_path, wav_path)
            return "", 204

        final_keyword = None
        confidence = 0
        #own model
        try:
            keyword, confidence = predict_keyword(wav_path)

            if keyword in VALID_KEYWORDS and confidence > 0.4:
                final_keyword = keyword
                source = "model"
        except Exception as e:
             print("Model Error:", e)
        #STT fallback
        if not final_keyword:
            final_keyword = keyword
            confidence = 0.6
            source = "speech_recognition"
            try:
                with sr.AudioFile(wav_path) as source:
                    audio = recognizer.record(source)

                text = recognizer.recognize_google(audio).lower()
                print("STT:", text)

                for key in VALID_KEYWORDS:
                    if key in text:
                        final_keyword = key
                        confidence = 0.6
                        break

            except Exception as e:
                print("STT ERROR:", e)

        cleanup(webm_path, wav_path)


        if final_keyword in VALID_KEYWORDS:
            return jsonify({
                "keyword": final_keyword,
                "confidence": confidence,
                "source": "model" if confidence > 0.4 else "speech_recognition",
                "description": DESCRIPTIONS.get(final_keyword, "No description available")
            })

        return "", 204

    except Exception as e:
        print("Audio error:", repr(e))
        cleanup(webm_path, wav_path)
        return "", 204


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5002, debug=True)