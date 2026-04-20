import os
import random
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
import librosa
from torch.utils.data import DataLoader, TensorDataset

SAMPLE_RATE = 16000
BATCH_SIZE = 8
EPOCHS = 25
DATASET_PATH = "dataset_tts"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


COMMANDS = sorted([
    d for d in os.listdir(DATASET_PATH)
    if os.path.isdir(os.path.join(DATASET_PATH, d))
])
print("Commands:", COMMANDS)

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
        x = torch.nn.functional.adaptive_avg_pool2d(x, (5,5))
        x = x.view(x.size(0), -1)
        return self.fc(x)

model = KeywordModel(len(COMMANDS)).to(DEVICE)


def load_data():
    data, labels = [], []

    for label, command in enumerate(COMMANDS):
        folder = os.path.join(DATASET_PATH, command)
        files = [f for f in os.listdir(folder) if f.endswith(".wav")]
        print(f"{command}: {len(files)} files")

        for file in files:
            path = os.path.join(folder, file)
            try:
                audio, sr = librosa.load(path, sr=SAMPLE_RATE)

                # Convert to mono
                if len(audio.shape) > 1:
                    audio = np.mean(audio, axis=1)

                # Normalize
                audio = librosa.util.normalize(audio)

                # Random noise augmentation
                if random.random() < 0.5:
                    audio += np.random.randn(len(audio)) * 0.003

                # Random volume/time stretch
                if random.random() < 0.3:
                    audio = audio * random.uniform(0.8, 1.2)
                    audio = librosa.effects.time_stretch(audio, rate=random.uniform(0.8,1.2))

                # MFCC feature extraction
                mfcc = librosa.feature.mfcc(y=audio, sr=SAMPLE_RATE, n_mfcc=40)
                mfcc = (mfcc - np.mean(mfcc)) / (np.std(mfcc)+1e-6)

                data.append(torch.tensor(mfcc))
                labels.append(label)

            except Exception as e:
                print(f"Skipping {file}: {e}")

    return data, labels

data, labels = load_data()
print(f"\nLoaded {len(data)} samples")

# Pad/truncate sequences to same length
max_len = max([x.shape[1] for x in data])
processed = []
for x in data:
    if x.shape[1] < max_len:
        x = torch.nn.functional.pad(x, (0, max_len - x.shape[1]))
    else:
        x = x[:, :max_len]
    processed.append(x)

X = torch.stack(processed).unsqueeze(1)  # shape [N, 1, 40, max_len]
y = torch.tensor(labels)

# Split train/test
indices = list(range(len(X)))
random.shuffle(indices)
split = int(0.8 * len(X))
train_idx, test_idx = indices[:split], indices[split:]

X_train, y_train = X[train_idx], y[train_idx]
X_test, y_test = X[test_idx], y[test_idx]

train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=BATCH_SIZE, shuffle=True)


criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

for epoch in range(EPOCHS):
    model.train()
    total_loss = 0      
    correct = 0
    total = 0

    for xb, yb in train_loader:
        xb, yb = xb.to(DEVICE).float(), yb.to(DEVICE)

        optimizer.zero_grad()
        outputs = model(xb)
        loss = criterion(outputs, yb)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()
        correct += (outputs.argmax(1) == yb).sum().item()
        total += yb.size(0)

    train_acc = correct / total
    print(f"Epoch {epoch+1}: Loss={total_loss:.4f}, Train Acc={train_acc:.4f}")

model.eval()
with torch.no_grad():
    X_test = X_test.to(DEVICE).float()
    y_test = y_test.to(DEVICE)

    outputs = model(X_test)
    preds = outputs.argmax(1)
    test_acc = (preds == y_test).float().mean()
    print(f"\nTest Accuracy: {test_acc:.4f}")

torch.save({
    "model_state": model.state_dict(),
    "max_len": max_len,
    "commands": COMMANDS
}, "keyword_model_finetuned.pth")

print("Fine-tuned model saved!")