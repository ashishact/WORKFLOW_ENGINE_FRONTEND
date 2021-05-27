const simple_workflow_yaml = `# Example 1 - HTTP call
---
root:
  sequence:
    elements:
    - activity:
        name: CallHttp
        arguments:
        - https://us-central1-workflowsample.cloudfunctions.net/datetime
        result: currentTime
        return: currentTime.dayOfTheWeek`;

export default {
    simple_workflow_yaml
}