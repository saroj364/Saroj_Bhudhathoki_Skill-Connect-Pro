import torch
import torch.nn as nn
import numpy as np
import sounddevice as sd
import librosa
from collections import deque


SAMPLE_RATE = 16000
WINDOW_SECONDS = 1.5      # length of audio to process each time
STEP_SECONDS = 0.3        # how often we run detection
CONF_THRESHOLD = 0.3      # lower threshold for real-time
BUFFER_SECONDS = 3.0      # rolling buffer length

checkpoint = torch.load("keyword_model_finetuned.pth", map_location="cpu")
COMMANDS = checkpoint["commands"]
max_len = checkpoint["max_len"]

class KeywordModel(nn.Module):
    def __init__(self, num_commands):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.3),

            nn.Conv2d(16, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.3),

            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Dropout(0.3)
        )
        self.fc = nn.Sequential(
            nn.Linear(64*5*5, 128),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(128, num_commands)
        )

    def forward(self, x):
        x = self.conv(x)
        x = nn.functional.adaptive_avg_pool2d(x, (5,5))
        x = x.view(x.size(0), -1)
        return self.fc(x)

model = KeywordModel(len(COMMANDS))
model.load_state_dict(checkpoint["model_state"])
model.eval()


def process_audio_chunk(chunk):
    mfcc = librosa.feature.mfcc(y=chunk, sr=SAMPLE_RATE, n_mfcc=40)
    mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc)+1e-6)
    if mfcc.shape[1] < max_len:
        mfcc = torch.nn.functional.pad(torch.tensor(mfcc), (0, max_len - mfcc.shape[1]))
    else:
        mfcc = torch.tensor(mfcc[:, :max_len])
    mfcc = mfcc.unsqueeze(0).unsqueeze(0).float()  # shape [1,1,40,max_len]
    return mfcc

def detect_keywords(audio):
    mfcc = process_audio_chunk(audio)
    with torch.no_grad():
        output = model(mfcc)
        probs = torch.softmax(output, dim=1)
        conf, pred = torch.max(probs, 1)
        if conf.item() > CONF_THRESHOLD:
            return COMMANDS[pred.item()]
    return None

def listen_real_time():
    buffer_size = int(BUFFER_SECONDS * SAMPLE_RATE)
    step_size = int(STEP_SECONDS * SAMPLE_RATE)
    window_size = int(WINDOW_SECONDS * SAMPLE_RATE)

    audio_buffer = deque(maxlen=buffer_size)
    print("Listening for keywords... Press Ctrl+C to stop.")

    try:
        while True:
            audio_chunk = sd.rec(step_size, samplerate=SAMPLE_RATE, channels=1, dtype='float32')
            sd.wait()
            audio_chunk = audio_chunk.flatten()
            
            audio_buffer.extend(audio_chunk)

            if len(audio_buffer) >= window_size:
                current_window = np.array(list(audio_buffer)[-window_size:])
                keyword = detect_keywords(current_window)
                if keyword:
                    print(f"Detected keyword: {keyword}")
    except KeyboardInterrupt:
        print("Stopped listening.")

if __name__ == "__main__":
    listen_real_time()