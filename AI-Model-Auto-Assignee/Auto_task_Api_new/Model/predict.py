# model/predict.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import numpy as np
import matplotlib.pyplot as plt
import nltk
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import string

# Load the trained model
model = joblib.load('trained_model1.pkl')
# Load the vectorizer used during training
vectorizer = joblib.load('vectorizer1.pkl')

# Download NLTK resources (needed for stopwords list and tokenizer)
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

##Using nlp to tokenize, lemmarize 
# Define function to remove URLs from text
def remove_urls(text):
    return re.sub(r'http\S+', '', text)

def preprocess_text(text):
    if text is None:
        return []

    # Remove URLs
    text = remove_urls(text)

    # Tokenize words and remove punctuation
    tokenized_words = nltk.word_tokenize(text.translate(str.maketrans('', '', string.punctuation)))

    # Get the list of stopwords
    stop_words = set(stopwords.words('english'))

    # Lemmatize and remove stopwords
    lemmatizer = WordNetLemmatizer()
    filtered_tokens = [lemmatizer.lemmatize(word.lower()) for word in tokenized_words if word.lower() not in stop_words]

    return filtered_tokens

def predict(description, summary, labels, priority_data):
    # Preprocess input data
    preprocessed_description = preprocess_text(description)
    preprocessed_summary = preprocess_text(summary)
    preprocessed_labels = preprocess_text(' '.join(labels))
    # Define a mapping dictionary for priority
    priority_mapping = {
        'NaN':0,
        '1 - Blocker': 1,
        '2 - Critical': 2,
        '3 - High': 3,
        '4 - Normal': 4,
        '5 - Minor': 5,
        '6 - Trivial': 6,
        'Lowest': 1,  # Assuming 'Lowest' is similar to '1 - Blocker'
        'Low': 2,     # Assuming 'Low' is similar to '2 - Critical'
        'Medium': 4,  # Assuming 'Medium' is similar to '4 - Normal'
        'High': 3     # Assuming 'High' is similar to '3 - High'
    }

    # Map the text priority to its numerical value using the priority_mapping dictionary
    priority = priority_mapping.get(priority_data)

    # Combine tokens of description, summary, and labels
    combined_tokens = preprocessed_description + preprocessed_summary + preprocessed_labels

    # Convert combined tokens to text
    combined_text = ' '.join(combined_tokens)

    # Append priority value to combined text
    X = [combined_text + " " + str(priority)]

    X_input = vectorizer.transform(X)

    # Make predictions using the trained model
    predictions = model.predict(X_input)

    ##top three predictions
    # find predictions probability
    predicted_proba = model.predict_proba(X_input)

    top_predictions = []
    prediction_dict = {}
    for probs in predicted_proba:
        top_indices = np.argsort(probs)[::-1][:3]  # Get indices of top three probabilities
        top_classes = model.classes_[top_indices]    # Get corresponding classes
        top_predictions.append(top_classes)
    ###
    # Print top predictions for each input
    for i, predictions in enumerate(top_predictions):
        print("Top three predictions:")
        for j, prediction in enumerate(predictions):
            # Update dictionary for each prediction containing name and probability
            prediction_dict[prediction] = round(predicted_proba[i][top_indices[j]], 2)
            print(f"{j+1}. {prediction}: {predicted_proba[i][top_indices[j]]:.2f}")
        print()
    return prediction_dict
