const simple_workflow_yaml = `# Example 1 - HTTP call
---
main:
  step1:
    call: http.get
    args:
      url: https://us-central1-workflowsample.cloudfunctions.net/datetime
    result: currentTime
    return: currentTime.dayOfTheWeek`;

const noops_workflow_yaml = `# Example 1 - HTTP call
---
name: "HOW"
main:
  step1: 
    call: sleep
    args:
      seconds: 4`
export default {
    simple_workflow_yaml,
    noops_workflow_yaml
}