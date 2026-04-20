import torch
import librosa
import numpy as np

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

checkpoint = torch.load("keyword_model_finetuned.pth", map_location=DEVICE)

COMMANDS = checkpoint["commands"]
MAX_LEN = checkpoint["max_len"]

class KeywordModel(torch.nn.Module):
    def __init__(self, num_commands):
        super().__init__()
        self.conv = torch.nn.Sequential(
            torch.nn.Conv2d(1, 16, 3, padding=1),
            torch.nn.BatchNorm2d(16),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(2),
            torch.nn.Dropout(0.3),

            torch.nn.Conv2d(16, 32, 3, padding=1),
            torch.nn.BatchNorm2d(32),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(2),
            torch.nn.Dropout(0.3),

            torch.nn.Conv2d(32, 64, 3, padding=1),
            torch.nn.BatchNorm2d(64),
            torch.nn.ReLU(),
            torch.nn.MaxPool2d(2),
            torch.nn.Dropout(0.3)
        )

        self.fc = torch.nn.Sequential(
            torch.nn.Linear(64*5*5, 128),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.5),
            torch.nn.Linear(128, num_commands)
        )



    def forward(self, x):
        x = self.conv(x)
        x = torch.nn.functional.adaptive_avg_pool2d(x, (5,5))
        x = x.view(x.size(0), -1)
        return self.fc(x)

model = KeywordModel(len(COMMANDS)).to(DEVICE)
model.load_state_dict(checkpoint["model_state"])
model.eval()

def predict_keyword(audio_path):
    try:
        audio, sr = librosa.load(audio_path, sr=16000)

        mfcc = librosa.feature.mfcc(y=audio, sr=16000, n_mfcc=40)
        mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc)+1e-6)

        # pad / truncate
        if mfcc.shape[1] < MAX_LEN:
            pad_width = MAX_LEN - mfcc.shape[1]
            mfcc = np.pad(mfcc, ((0,0),(0,pad_width)))
        else:
            mfcc = mfcc[:, :MAX_LEN]

        tensor = torch.tensor(mfcc).unsqueeze(0).unsqueeze(0).float().to(DEVICE)

        with torch.no_grad():
            output = model(tensor)
            probs = torch.softmax(output, dim=1)
            conf, pred = torch.max(probs, dim=1)

        return COMMANDS[pred.item()], conf.item()

    except Exception as e:
        print("Model error:", e)
        return None, 0