import numpy as np
import json
import random
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Activation, Dropout
from tensorflow.keras.optimizers import SGD

# Load intents file
with open('intents.json') as file:
    intents = json.load(file)

# Initialize variables
words = []
classes = []
documents = []
ignore_words = ['?', '!']

# Preprocess the data
for intent in intents['intents']:
    for pattern in intent['patterns']:
        # Tokenize each word
        w = pattern.split()
        words.extend(w)
        # Add documents in the corpus
        documents.append((w, intent['tag']))
        # Add to our classes list
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# Lemmatize and lower each word and remove duplicates
words = sorted(list(set([word.lower() for word in words if word not in ignore_words])))

# Initialize training data
training = []
output_empty = [0] * len(classes)

# Create training set, bag of words for each sentence
for doc in documents:
    bag = []
    pattern_words = doc[0]
    # Create bag of words array
    for word in words:
        bag.append(1) if word in pattern_words else bag.append(0)

    # Output is '0' for each tag and '1' for current tag
    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1

    training.append([bag, output_row])

# Shuffle the training data
random.shuffle(training)

# Separate features and labels
train_x = np.array([x[0] for x in training])
train_y = np.array([x[1] for x in training])

# Create model
model = Sequential([
    Dense(128, input_shape=(len(train_x[0]),), activation='relu'),
    Dropout(0.5),
    Dense(64, activation='relu'),
    Dropout(0.5),
    Dense(len(train_y[0]), activation='softmax')
])

# Compile model
sgd = SGD(learning_rate=0.01, decay=1e-6, momentum=0.9, nesterov=True)
model.compile(loss='categorical_crossentropy', optimizer=sgd, metrics=['accuracy'])

# Fit model
model.fit(train_x, train_y, epochs=200, batch_size=5, verbose=1)

# Save model
model.save('chatbot_model.h5')
