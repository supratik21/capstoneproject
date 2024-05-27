# run.py

from flask import Flask, request, jsonify
from Model.predict import predict

app = Flask(__name__)

@app.route("/")
def predict_task_assignment():
    # Get data from the request
   # data = request.json

    # Extract input features from the request data
    #description = data.get("description")
   #summary = data.get("summary")
   #labels = data.get("labels")
    #priority = data.get("priority")

    # Example input data
    description = "When promoting a docker image you need to specify the build info of the image you want to promote. There is currently no built-in way to get build info from an existing Artifact.\r\n\r\nThe only way of getting build info from an existing Artifact in Artifactory is by using the REST API and getting the `properties` of an artifact.\r\n\r\nEven your youtube video shows the usage of cURL in the process of promoting a docker image:\r\nhttps://www.youtube.com/watch?v=3UaqJGXMp8w\r\n\r\nI would like some addition to `Artifactory.server` so you can call something like:\r\n \r\n{code:java}\r\n- task: ArtifactoryGetBuildInfo@1 \r\n  displayName: 'Get Build Info From Artifactory' \r\n  inputs:\r\n    artifactoryService: 'Artifactory Widex'\r\n    artifactName: 'someArtifact'\r\n    repository: 'docker-snapshot-local/cool_Image:coolerTag'\r\n    variableToSave: 'image_build_info'{code}\r\n \r\nwhere `variableToSave` is the name of the variable that will contain the build info.\r\n \r\nMaybe the same functionality for getting `properties` of an artifact."
    summary = "Support For new Overwriting of Docker Tags in Release Bundles v2. Support Bundle creation with the 24 hours time range is not working as expected."
    labels = ["Docker", "containers", "metadata", "registry"]
    priority = "High"
    # Call the predict function
    predictions = predict(description, summary, labels, priority)
    print("predictions : ", predictions)
    # Return the predictions as JSON response
    #return jsonify({"predictions": predictions}), 200
    # Return the predictions as JSON response
    return jsonify({"Assignee": predictions}), 200

if __name__ == "__main__":
    app.run(debug=True)
