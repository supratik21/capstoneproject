from flask import Flask, request, jsonify
from Model.predict import predict
import requests
import json
import numpy as np

app = Flask(__name__)

# Define Jira API endpoint and credentials
JIRA_API_URL = "https://capstonegroupproject.atlassian.net/"  # Your Jira API URL
JIRA_USERNAME = "ma243@uowmail.edu.au"  # Your Jira username
JIRA_PASSWORD = "ATATT3xFfGF0z6chrn0hmnJAVraXd4XJIo84O0-Sjiuf3pkyvktqSmpybwBAjP2PCIZKbs8wivtuc084Du9weBm3JTgjUpUJkqMpE7Sr2jcW01mw5YtufF8QNkgUtv7LftNyStpdX82sMFujsecYAEQFkxwLJhgBKYp3Mf1t2v9MCap_Y7qtUrs=80D1AE87"

def get_issue_data(issue_id):
    """
    Function to fetch issue data from Jira API.
    """
    url = f"{JIRA_API_URL}/rest/api/2/issue/{issue_id}"
    response = requests.get(url, auth=(JIRA_USERNAME, JIRA_PASSWORD))
    if response.status_code == 200:
        issue_data = response.json()
        return issue_data
    else:
        return None

def add_comment(issue_id, comment):
    """
    Function to add a comment to a Jira issue.
    """
    url = f"{JIRA_API_URL}/rest/api/2/issue/{issue_id}/comment"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "body": comment
    }
    response = requests.post(url, json=data, headers=headers, auth=(JIRA_USERNAME, JIRA_PASSWORD))
    return response.status_code == 201 

def fetch_assignee_id(assignees_with_probabilities):
    print("Inside")
    assignee_ids = {}

    for assignee, probability in assignees_with_probabilities.items():
        url = f"{JIRA_API_URL}/rest/api/latest/user/search?query={assignee}"
        print(url)
        headers = {
            "Authorization": "Basic your_api_token",
            "Accept": "application/json"
        }
        response = requests.get(url, headers=headers, auth=(JIRA_USERNAME, JIRA_PASSWORD))
        data = response.json()
        
        if data:
            # Assuming the first result is the correct user
            account_id = data[0]['accountId']
            assignee_ids[account_id] = probability
        else:
            assignee_ids[assignee] = None
    print(assignee_ids)
    return assignee_ids


def update_assignee(issue_id, assignee):
    """
    Function to update assignee of a Jira issue.
    """
    url = f"{JIRA_API_URL}/rest/api/2/issue/{issue_id}/assignee"
    headers = {
        "Content-Type": "application/json"
    }  
    data = {'accountId': '712020:11f84c91-2eb4-4a44-9259-6fc265541d46' } ##for one person                   
    response = requests.put(url, json=data, headers=headers, auth=(JIRA_USERNAME, JIRA_PASSWORD))
    return response.status_code == 204

@app.route("/")
def predict_task_assignment():
    # Extract issue URL from the request
    issue_url = "https://capstonegroupproject.atlassian.net/browse/FCS-138"  # Your Jira issue URL
    if not issue_url:
        return jsonify({"error": "Issue URL not provided"}), 400

    # Extract issue ID from the issue URL
    issue_id = issue_url.split("/")[-1]

    # Fetch issue data from Jira API
    issue_data = get_issue_data(issue_id)

    if issue_data:
        # Extract relevant fields from the issue data
        description = issue_data.get("fields", {}).get("description")
        summary = issue_data.get("fields", {}).get("summary")
        labels = issue_data.get("fields", {}).get("labels", [])
        priority = issue_data.get("fields", {}).get("priority", {}).get("name")

        # Call the predict function
        predictions = predict(description, summary, labels, priority)
        print(predictions)
        print("Boom boom")
        if isinstance(predictions, dict) and predictions:
            # Sort predictions based on probability in descending order
            sorted_predictions = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
            
            # Get the top 3 assignees with the highest probabilities
            top_assignees = sorted_predictions[:3]

            # Fetch assignee IDs for the top 3 assignees
            assignee_ids = fetch_assignee_id({assignee: probability for assignee, probability in top_assignees})
            print('ASSIGNEE IDs :', assignee_ids)

            if assignee_ids is not None:
                # Convert assignee_ids to a list of dictionaries for JSON serialization
                assignee_list = [{"id": assignee_id, "probability": probability} for assignee_id, probability in assignee_ids.items()]
                return jsonify(assignee_list), 200
            else:
                return jsonify({"error": "Prediction failed"}), 500
        else:
            return jsonify({"error": "No valid predictions found"}), 500

if __name__ == "__main__":
    app.run(debug=True)
