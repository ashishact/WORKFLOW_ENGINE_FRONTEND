
interface WF_YAML {
    name: string,
    code: string,
}

const yamls:WF_YAML[] = [];


yamls.push({name : "01 - Hello World", code: `
# 01 - Hello World
---
name: "Hello World"
main:
  step_one: 
    return: "Hello World"
`});


yamls.push({name : "02 - Call a activity", code: `
# 02 - Call a activity
---
name: "Sleep"
main:
  step_one: 
    call: sleep
    args:
      seconds: 4
`});


yamls.push({name : "03 - Http Get", code: `
# 03 - Http Get
---
main:
  getDayOfWeek:
    call: http.get
    args:
      url: http://worldclockapi.com/api/json/est/now
    result: currentTime
    return: currentTime.dayOfTheWeek
`});


yamls.push({name : "04 - Assign Variable", code: `
# 04 - Assign Variable
name: "Assign Variable"
main:
  step_one:
    assign:
      value1: 5
      value2: value1 + 3
      value3: "sum of all = "
    return: value3 + value2
`});


yamls.push({name : "05 - Expression in Arguments", code: `
# 05 - Expression in Arguments
name: "Expression in arguments"
main:
  step_zero:
    assign:
      key: "6132d68042e14b1f87e190827210306"
      city: "Tokyo"

  step_two_getWeather:
    call: http.get
    args:
      url: http://api.weatherapi.com/v1/current.json?key=\${key}&q=\${city}
    result: weather
    return: Temperature in \${city} is \${weather.current.temp_c} deg celcius
`});


yamls.push({name : "06 - Switch Condition", code: `
# 06 - Switch Condition
name: "Jump based on switch condition"
main:
    getCurrentTime:
        call: http.get
        args:
            url: https://us-central1-workflowsample.cloudfunctions.net/datetime
        result: currentTime
    conditionalSwitch:
        switch:
            - condition: currentTime.dayOfTheWeek == "Monday"
              next: monday
            - condition: currentTime.dayOfTheWeek == "Tuesday"
              next: tuesday
            - condition: currentTime.dayOfTheWeek == "Wednesday"
              next: wednesday
            - condition: currentTime.dayOfTheWeek == "Thursday"
              next: thursday
            - condition: currentTime.dayOfTheWeek == "Friday"
              next: friday
            - condition: currentTime.dayOfTheWeek == "Saturday" || currentTime.dayOfTheWeek == "Sunday"
              next: weekend
        next: noday
    monday:
        return: "It's Monday. Make cookies with a smiley faces."
    tuesday:
        return: "It's Tuesday. There’s no need to have Pokemon Go, wear a Pikachu pyjamas."
    wednesday:
        return: "It's Wednesday. When on a stroll, jump for a photo shot."
    thursday:
        return: "It's Thursday. Don’t miss the fun even when you are alone, watch a comedy."
    friday:
        return: "It's Friday! Almost the weekend!. Don’t let the rain spoils your fun, have an indoor picnic."
    weekend:
        return: "It's the weekend!. Do whatever you want"
    noday:
        return: "I have no idea what day it is"
`});


yamls.push({name : "07 - Match", code: `
# 07 - Match
name: "Expression in arguments"
main:
  step_zero:
    assign:
      key: "6132d68042e14b1f87e190827210306"
      city: "Tokyo"

  step_two_getWeather:
    call: http.get
    args:
      url: http://api.weatherapi.com/v1/current.json?key=\${key}&q=\${city}
    result: weather
  
  step_three:
    match:
      on: weather.current.temp_c
      conditions:
        - (t = )
`});


yamls.push({name : "08 - Match Expression", code: `
# 08 - Match Expression
---
name: "Match Expression"
main:
  step_zero:
    call: http.get
    args:
      url: http://worldclockapi.com/api/json/est/now
    result: currentTime
        
  step_one: 
    match: 
      on: currentTime.dayOfTheWeek
      conditions:
        -  (b = "Thursday") => value = 'Yo! Thursday'
        -  (d = "Monday")   => value = 'Monday'
        -  (x)              => value = "Unknown Day"
  step_two:
    return: value
`});


yamls.push({name : "08 - Match Expression Tail", code: `
# 08 - Match Expression Tail
---
name: "Match Expression Tail"
main:
  step_two:
    assign:
        person: { name: 'Maria'}
        ages: [24, 25, 26, 27, 28]
    match:
        on: ages
        conditions:
            - (x = person)      => value = 1
            - (a1, a2, rest)    => value = rest
    return: value
`});


yamls.push({name : "03 - Check If Valid Date", code: `
# 03 - Check If Valid Date
---
main:
    getDayOfWeek:
        call: http.get
        args:
            url: http://worldclockapi.com/api/json/est/now
        result: currentTime
    check:
        match:
            on: new Date(currentTime.currentDateTime)
            conditions:
                - (d = Date) => value = d
                - (x)        => value = false
        return: value
    step3:
        switch:
            - condition: value
              next: date
        next: nodate
    date:
        return: "Yes it's a date"
    nodate:
        return: "Not a date"
`});


yamls.push({name : "02 - Timeout", code: `
# 02 - Timeout
---
name: "Sleep"
timeout: 5
main:
  step_one: 
    call: sleep
    args:
      seconds: 10
`});


yamls.push({name : "- Retry whne service unavailable", code: `
# - Retry whne service unavailable
`});


export default {yamls}