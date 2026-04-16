import os
import pyttsx3
from gtts import gTTS
import random

OUTPUT_DIR = "dataset_tts"
SAMPLES_PER_KEYWORD = 20  

KEYWORDS = {
    "javascript": ["javascript", "java script"],
    "function": ["function"],
    "object": ["object"],
    "api": ["api", "a p i"],
    "database": ["database", "data base"],
    "json": ["json", "j s o n"],
    "async": ["async", "a sync"],
    "node": ["node", "node js"],
    "express": ["express"],
    "authentication": ["authentication", "auth"],
    "jwt": ["jwt", "j w t"],
    "microservices": ["micro services"],
    "caching": ["caching", "cache"],
    "scalability": ["scalability", "scaling"],
    "architecture": ["architecture"],
    "class": ["class"],
    "components": ["components"],
    "state": ["state"],
    "props": ["props"],
    "hooks": ["hooks"],
    "routing": ["routing"],
    "deployment": ["deployment"],
    "docker": ["docker"],
    "containers": ["containers"],
    "cloud": ["cloud"],
    "monitoring": ["monitoring"],
    "automation": ["automation"],
    "security": ["security"],
    "sql": ["sql", "sequel", "s q l"],
    "vulnerabilities": ["vulnerabilities"],
    "penetration": ["penetration"],
    "encryption": ["encryption"],
    "exploits": ["exploits"],
    "mongodb": ["mongo db"],
    "schema": ["schema"],
    "collections": ["collections"],
    "indexing": ["indexing"],
    "queries": ["queries"],
    "aggregation": ["aggregation"],
    "nosql": ["no sql"]
}

for keyword in KEYWORDS.keys():
    os.makedirs(os.path.join(OUTPUT_DIR, keyword), exist_ok=True)

engine = pyttsx3.init()
voices = engine.getProperty('voices')

print("Generating offline samples...")

for keyword, variations in KEYWORDS.items():
    for i in range(SAMPLES_PER_KEYWORD):
        phrase = random.choice(variations)

        voice = random.choice(voices)
        engine.setProperty('voice', voice.id)

        filename = os.path.join(OUTPUT_DIR, keyword, f"{i}_offline.wav")
        engine.save_to_file(phrase, filename)
        engine.runAndWait()

print("Generating online samples...")

for keyword, variations in KEYWORDS.items():
    for i in range(SAMPLES_PER_KEYWORD):
        phrase = random.choice(variations)

        tts = gTTS(text=phrase, lang='en')
        filename = os.path.join(OUTPUT_DIR, keyword, f"{i}_online.wav")
        tts.save(filename)

print("TTS dataset generation complete!")