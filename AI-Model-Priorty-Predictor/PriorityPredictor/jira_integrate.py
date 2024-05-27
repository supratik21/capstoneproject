from flask import Flask, request, jsonify
from Model.predict import predict
import requests
import json


app = Flask(__name__)

# Define Jira API endpoint and credentials
JIRA_API_URL = "https://capstonegroupproject.atlassian.net"  # Your Jira API URL
JIRA_USERNAME = "ss7178@uowmail.edu.au"  # Your Jira username
JIRA_PASSWORD = "ATATT3xFfGF07-kn-c_-meHB1qQrf-WAuWzpcT2qrvfJREbs39O0PGkbPESmwstHznVBsqnBXOTTwQGOm8H64wDZoLWsr_2Lt_MeV8k8ZNdvnj47GNu6VeetPUrbyNqopJTtqtcSNvz8GWYkiqp6Od7r4SoB05sCNAHLqUAJreLg_C5o4fpZ0ro=8AE86842"

# JIRA_USERNAME = "amk703@uowmail.edu.au"  # Your Jira username
# JIRA_PASSWORD = "ATATT3xFfGF0BvkdKXkES_-yh887mdpnyh-OTP3GueWGn3XmQNBlgLUB3LzfmhQLQLUdq0_PISfsGByiN7MrX8HxVH2e0xJMoP-nhUlMr3CgZIILyMWMvTyRNOo20f6UnllIepaK4PETydKcFuiFYXjOSW3ZudVLcqwYejLRZNroGMK7HQJkNIo=C68D375E"

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

@app.route("/", methods=["POST"])
def predict_task_priority():
    # Extract issue URL from the request body
    request_data = request.json
    issue_url = request_data.get("issue_url")

    if not issue_url:
        return jsonify({"error": "Issue URL not provided in the request body"}), 400


    # Extract issue ID from the issue URL
    issue_id = issue_url.split("/")[-1]

    # Fetch issue data from Jira API
    issue_data = get_issue_data(issue_id)

    if issue_data:
        # Extract relevant fields from the issue data
        description = issue_data.get("fields", {}).get("description")
        summary = issue_data.get("fields", {}).get("summary")
        labels = issue_data.get("fields", {}).get("labels", [])

        # Call the predict function
        predictions = predict(description, summary, labels)
        print('PRIORITY : ',predictions)
        
        if predictions :
            # Convert the elements of assignee to strings if they are not already
            predictions = [str(name) for name in predictions]
            return jsonify({"Priority": predictions}), 200


        else:
            return jsonify({"error": "Prediction failed"}), 500
    else:
        return jsonify({"error": "Failed to fetch issue data from Jira"}), 500

if __name__ == "__main__":
    app.run(debug=True)
