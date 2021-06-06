
interface WF_YAML {
    name: string,
    code: string,
}

const yamls:WF_YAML[] = [];


yamls.push({name : "01 - Hello World", code: `
# 01 - Hello World

# 1. Click on RUN (top right) and this workflow will be executed
# 2. If it fails or takes longer than expected click on the TERMINATE Button
# 3. Logs will be displayed at the right half
# 4. Check  EXECUTION INFO => "status": COMPLETED | FAILED | TERMINATED
# 5. Results is displayed at the end on WorkflowExecutionCompleted 
# 6. There is also the FULL STATUS and FULL HISTORY of execution (scroll down to see)
# 7. If you are not able to run a workflow => RELOAD the page and try again

---

name: "Hello World"
main:
  step_one: 
    return: "Hello World"
`});


yamls.push({name : "02 - Call a activity", code: `
# 02 - Call a activity

# 1. If you don't provide a valid number for "seconds" . Then the workflow will faill and it will try again. But then it will fail again
# 2. The default execution timeout is 10 seconds for each step so make sure "seconds" < 10 for the task to be successful
# 3. If "seconds" > 10 check the timeout example how to set timeouts
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

# 1. Here first te result is stored into a vraiable called "currentTime"
# 2. Unlike Google workflow we don't have to use \${currentTime.dayOfTheWeek}
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

# 1. Assignment is ordered so we can use variables defined before in this steps or previous steps
# 2. For string literal use double quotes i.e =>
# 3. string constant  =>  value: "name"
# 4. variable         =>  value: name  # note; name must be defined before

---
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

# 1. We use \${var} only within strings everywhere else we can just use var  
---
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

# 1. condition takes any valid javascript code
---
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


yamls.push({name : "07 - Array and Loop", code: `
# 07 - Array and Loop

# 1. There is a limit to how much you can loop through -> It's done to protect the workers from going into infinite loops
# 2. Maximum number steps is set to 100 
# 3. Or 10 times the number of steps in this workflow
---

name: "Array and Loop"
main:
  define:
    assign:
      array: ["foo", "ba", "r"]
      result: ""
      i: 0
  check_condition:
    switch:
      - condition: array.length > i
        next: iterate
    next: exit_loop
  iterate:
    assign:
      result: result + array[i]
      i: i+1
    next: check_condition
  exit_loop:
    return: result
`});


yamls.push({name : "08 - Match Expression", code: `
# 08 - Match Expression

# 1. See: https://github.com/z-pattern-matching/z for how to use
# 2. Basic idea is match things on value and execute a predicate
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


yamls.push({name : "09 - Match Expression Array Tail", code: `
# 09 - Match Expression Array Tail

# 1. The idea is taken from functional languages (Haskel/Ocaml) and can be quite prowerful sometimes
---

name: "Match Expression Array Tail"
main:
  step_two:
    assign:
        numbers: [24, 25, 26, 27, 28]
    match:
        on: numbers
        conditions:
            - (a1, a2, rest)    => withoutFirstTwo = rest
    return: withoutFirstTwo
`});


yamls.push({name : "10 - Match Expression Object Props", code: `
# 10 - Match Expression Object Props

# 1. We should be able to use (x = {country: 'Japan'}) directly but it give yaml error
---
name: "Match Expression Object Props"
main:
  step_two:
    assign:
        person: { name: 'Maria', age: 27, country: 'Japan'}
        country: {country: 'India'}
    match:
        on: person
        conditions:
            - (x = country)     => value = 'You are from Japan'
            - (x)               => value = 'You are from ' + x.country
    return: value
`});


yamls.push({name : "11 - Check If Valid Date", code: `
# 11 - Check If Valid Date
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


yamls.push({name : "12 - Timeout", code: `
# 12 - Timeout

# 1. This will fail as we are trying to sleep for 10 seconds but the timeout is 5 sec
---
name: "Sleep"
timeout: 5
main:
  step_one: 
    call: sleep
    args:
      seconds: 10
`});


yamls.push({name : "13 - Dictionary", code: `
# 13 - Dictionary
---
name: "Dictionary"
main:
  createDictionary:
    assign:
      myDictionary: {FirstName: "John", LastName: "Smith", Age: 26, Address: { Street: "Flower Road 12", City: "Superville", Country: "Atlantis"}}
  finally:
    return: myDictionary.Address.Country
`});


yamls.push({name : "14 - Wikipedia search", code: `
# 14 - Wikipedia search
---
name: "Wikipedia search"
main:
  getDayOfWeek:
    call: http.get
    args:
      url: https://us-central1-workflowsample.cloudfunctions.net/datetime
    result: currentTime
  prepareParam:
    assign:
      search: currentTime.dayOfTheWeek
  readWikipedia:
    call: http.get
    args:
      url: https://en.wikipedia.org/w/api.php?action=opensearch&search=\${search}&limit=10&namespace=0&format=json
    result: wikipediaResult
    return: wikipediaResult
`});


export default {yamls}