# Jira Plugin Solutions: A Suite of Custom Plugins

## Overview

Welcome to the Jira Plugin Solutions repository! This project, developed as part of the CSIT998 Professional Capstone Project, includes six custom Jira plugins designed to enhance project management capabilities. These plugins extend Jira's functionality, providing valuable insights and automation to improve team efficiency and decision-making.

## Plugins

1. **AI Auto Assign**
2. **AI Priority Predictor**
3. **SLA Management**
4. **Aged Ticket Analysis**
5. **Continual Service Improvement**
6. **DevOps Metrics**

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Plugins](#plugins)
  - [AI Auto Assign](#ai-auto-assign)
  - [AI Priority Predictor](#ai-priority-predictor)
  - [SLA Management](#sla-management)
  - [Aged Ticket Analysis](#aged-ticket-analysis)
  - [Continual Service Improvement](#continual-service-improvement)
  - [DevOps Metrics](#devops-metrics)
- [Development](#development)
- [Dependencies](#dependencies)
- [Contributing](#contributing)

## Introduction

Project management often faces challenges that can be mitigated with intelligent solutions. While Jira is a powerful tool, it can be further enhanced with custom plugins to meet specific needs. Our suite of six plugins leverages AI and advanced data analysis to automate tasks, provide real-time insights, and improve overall project management efficiency.

## Installation

To install any of the plugins:

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository: `git clone https://github.com/yourusername/jira-plugin-solutions.git`
3. Navigate to the plugin directory: `cd jira-plugin-solutions`
4. Install the necessary dependencies:
   ```bash
   npm install
   ```

For AI Python dependencies, run the following commands:

```bash
pip install pandas
pip install sklearn
pip install flask
pip install scikit-learn
pip install matplotlib
pip install nltk
pip install requests
```

## Usage

1. Follow the [installation](#installation) steps to set up the plugins.
2. Deploy the plugins using the Atlassian Forge CLI:
   ```bash
   forge deploy
   ```
3. Install the plugins on your Jira instance:
   ```bash
   forge install
   ```
4. Configure the plugins as needed via the Jira UI.

## Plugins

### AI Auto Assign

This plugin utilizes machine learning to automatically assign issues to the most suitable team members based on past assignments and issue characteristics.

### AI Priority Predictor

This plugin predicts the priority of new issues using natural language processing techniques, helping teams prioritize work effectively.

### SLA Management

This plugin tracks service level agreements, ensuring compliance and alerting managers to potential breaches.

### Aged Ticket Analysis

This plugin provides a dashboard for tracking the age of tickets, helping to identify and address issues that have been open for extended periods.

### Continual Service Improvement

This plugin offers real-time analytics and reporting to support continuous service improvement, tracking open and closed issues over time.

### DevOps Metrics

This plugin provides comprehensive analytics on key DevOps metrics such as lead time, change failure rate, mean time to recovery, and throughput.

## Development

For development, follow these steps:

1. Clone the repository: `git clone https://github.com/yourusername/jira-plugin-solutions.git`
2. Navigate to the plugin directory: `cd jira-plugin-solutions`
3. Install the dependencies:
   ```bash
   npm install
   ```
4. For AI Python dependencies, run:
   ```bash
   pip install pandas
   pip install sklearn
   pip install flask
   pip install scikit-learn
   pip install matplotlib
   pip install nltk
   pip install requests
   ```
5. Use the Forge CLI to develop and test plugins locally.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.
