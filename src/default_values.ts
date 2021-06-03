interface WF_YAML {
    name: string,
    code: string,
}

const wf_yaml:WF_YAML[] = [];



let y:WF_YAML = {name : "", code: ""};
y.name = "01 - Hello World";
y.code = `
# 01 - Hello World
# ! Not Working
---
name: "Hello World"
main:
    step_one: 
        return: "Hello World"
`
wf_yaml.push(y);






const simple_workflow_yaml = `
# Example 1 - HTTP call
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
    wf_yaml
}