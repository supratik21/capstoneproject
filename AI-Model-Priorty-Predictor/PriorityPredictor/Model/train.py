# model/train.py

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
from sklearn.metrics import accuracy_score, classification_report
from sklearn.naive_bayes import MultinomialNB

import string
# Download NLTK resources (needed for stopwords list and tokenizer)
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

####
# Load data
#df = pd.read_json('../JiraRepos_JFrog_data.json')


#######
# Preprocess data
######
# Load data from CSV file with specific columns
df = pd.read_csv('./Jira_data_extended.csv', usecols=['Summary', 'Description', 'Labels', 'Priority'])

##Priority Column
# Define a mapping dictionary for priority

# Replace NaN values with empty strings
df.fillna('', inplace=True)

priority_mapping = {
    'NaN':6,
    'Lowest': 5,  # Assuming 'Lowest' is similar to '1 - Blocker'
    'Low': 4,     # Assuming 'Low' is similar to '2 - Critical'
    'Medium': 3,  # Assuming 'Medium' is similar to '4 - Normal'
    'High': 2, # Assuming 'High' is similar to '3 - High'
    'Highest': 1
}
# Map the priority values to numerical values
df['priority_encoded'] = df['Priority'].map(priority_mapping)
# Drop rows with NaN values in the 'priority' column
df = df.dropna(subset=['Priority'])




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

# Apply the preprocess_text function to each description in the 'description' column
preprocessed_tokens_descriptions = [preprocess_text(description) for description in df['Description'].values]
# Apply the preprocess_text function to each description in the 'description' column
preprocessed_tokens_summary = [preprocess_text(summary) for summary in df['Summary'].values]
# Apply the preprocess_text function to each label in the 'labels' column
preprocessed_tokens_label = [preprocess_text(' '.join(label)) if label is not None else [] for label in df['Labels'].values]

# Combine tokens of description and labels and summary 
combined_tokens = []
for desc_tokens,summary_tokens, label_tokens in zip(preprocessed_tokens_descriptions,preprocessed_tokens_summary, preprocessed_tokens_label):
    combined_tokens.append(desc_tokens + summary_tokens + label_tokens )

# Convert combined tokens to text
X_combined = [' '.join(tokens) for tokens in combined_tokens]
# Convert priority Series to a list of strings
priority_list = df['Priority'].astype(str).tolist()
# Combine X_description with priority_list
#X = [desc + ' ' + priority for desc, priority in zip(X_combined, priority_list)]
X=X_combined
y = priority_list

# Feature extraction
vectorizer = TfidfVectorizer()
X_vectorized = vectorizer.fit_transform(X)
#print('vectorizer.vocabulary_ ', vectorizer.vocabulary_)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_vectorized, y, test_size=0.2, random_state=42)


# Initialize and train the Naive Bayes classifier
nb_classifier = MultinomialNB()
nb_classifier.fit(X_train, y_train)
# Make predictions
y_pred_nb = nb_classifier.predict(X_test)

# Evaluate Naive Bayes performance
accuracy_nb = accuracy_score(y_test, y_pred_nb)
print(f'Naive Bayes Accuracy: {accuracy_nb}')

# Save the trained model
joblib.dump(nb_classifier, 'trained_model1.pkl')

joblib.dump(vectorizer, 'vectorizer1.pkl')