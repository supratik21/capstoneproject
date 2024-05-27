from flask import Flask, request, jsonify
from Model.predict import predict
import requests
import json
import numpy as np

app = Flask(__name__)

# Define Jira API endpoint and credentials
JIRA_API_URL = "https://capstonegroupproject.atlassian.net"  # Your Jira API URL
JIRA_USERNAME = "ss7178@uowmail.edu.au"  # Your Jira username
JIRA_PASSWORD = "ATATT3xFfGF07-kn-c_-meHB1qQrf-WAuWzpcT2qrvfJREbs39O0PGkbPESmwstHznVBsqnBXOTTwQGOm8H64wDZoLWsr_2Lt_MeV8k8ZNdvnj47GNu6VeetPUrbyNqopJTtqtcSNvz8GWYkiqp6Od7r4SoB05sCNAHLqUAJreLg_C5o4fpZ0ro=8AE86842"

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

def fetch_assignee_id(assignees_with_probabilities):
    assignee_ids = []

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
            assignee_ids.append({
                    "name": assignee,
                    "accountId": account_id,
                    "probability": probability
                })
        else:
             assignee_ids.append({
                    "name": assignee,
                    "accountId": None,
                    "probability": probability
                })
    print(assignee_ids)
    return assignee_ids

@app.route("/", methods=["POST"])
def predict_task_assignment():
    # Extract issue URL from the request body
    request_data = request.json
    issue_url = request_data.get("issue_url")
    print(issue_url)
    if not issue_url:
        return jsonify({"error": "Issue URL not provided in the request body"}), 400

    # Extract issue ID from the issue URL
    issue_id = issue_url.split("/")[-1]

    # Fetch issue data from Jira API
    issue_data = get_issue_data(issue_id)
    print(issue_data)

    if issue_data:
        # Extract relevant fields from the issue data
        description = issue_data.get("fields", {}).get("description")
        summary = issue_data.get("fields", {}).get("summary")
        labels = issue_data.get("fields", {}).get("labels", [])
        priority = issue_data.get("fields", {}).get("priority", {}).get("name")

        # Call the predict function
        predictions = predict(description, summary, labels, priority)
        print(predictions)
        
        if isinstance(predictions, dict) and predictions:
            # Sort predictions based on probability in descending order
            sorted_predictions = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
            
            # Get the top 3 assignees with the highest probabilities
            top_assignees = sorted_predictions[:3]

            # Fetch assignee IDs for the top 3 assignees
            assignee_ids = fetch_assignee_id({assignee: probability for assignee, probability in top_assignees})

            if assignee_ids is not None:
                return jsonify(assignee_ids), 200
            else:
                return jsonify({"error": "Prediction failed"}), 500
        else:
            return jsonify({"error": "No valid predictions found"}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)