//Selectors
const activityInput = document.querySelector(".activity-input")
const activityButton = document.querySelector(".activity-button")
const activityList = document.querySelector(".activity-list")

//Event Listeners
document.addEventListener("DOMContentLoaded", getActivities)
activityButton.addEventListener("click", addActivity)

//Functions
function addActivity(event) {
    event.preventDefault()
    
    //Getting activities for below reasons
    let activities = localActivityInit()
    var activityName = activityInput.value

    //If there is already a duplicate name
    while (activities.find((element) => { return element.name === activityName}) != undefined) {
        activityName = activityName + " copy"
    }

    //If input is empty don't run function
    if (!activityName) return

    //Initialise Activity Div
    const activityDiv = document.createElement("div")
    activityDiv.classList.add("activity")

    //Initialise Activity Name
    const newActivity = document.createElement("li")
    newActivity.innerText = activityName
    activityDiv.appendChild(newActivity)

    //Add Activity
    saveLocalActivities(activityName)

    // Stopwatch
    const stopwatchDiv = document.createElement("div")
    stopwatchDiv.innerText = "00:00:00"
    stopwatchDiv.classList.add("timer")
    stopwatchDiv.stopwatch = new Timer(stopwatchDiv, false, 0)
    activityDiv.appendChild(stopwatchDiv)

    // Stopwatch toggle button
    const toggleButton = document.createElement("button")
    toggleButton.innerHTML = '<i class="fa fa-play"></i>'
    toggleButton.classList.add("toggle-btn")
    toggleButton.addEventListener("click", toggleActivitySW)
    activityDiv.appendChild(toggleButton)

    // Reset stopwatch button
    const resetButton = document.createElement("button")
    resetButton.innerHTML = '<i class="fas fa-redo"></i>'
    resetButton.classList.add("reset-btn")
    resetButton.addEventListener("click", resetActivitySW)
    activityDiv.appendChild(resetButton)

    // Delete activity button
    const deleteButton = document.createElement("button")
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'
    deleteButton.classList.add("delete-btn")
    deleteButton.addEventListener("click", removeActivity)
    activityDiv.appendChild(deleteButton)


    //Adding the div to the activity list
    activityList.appendChild(activityDiv)

    //Resets input
    activityInput.value = ""
}

function toggleActivitySW(event) {
    const item = event.target

    const timer = item.previousSibling

    timer.stopwatch.toggle()
}

function resetActivitySW(event) {
    const item = event.target

    const timer = item.previousSibling.previousSibling

    timer.stopwatch.reset()
}

function removeActivity(event) {
    event.target.parentElement.remove()
    removeLocalActivity(event.target)
}

//Timer class and logic
class Timer {
    constructor (element, isRunning, overallTime) {
        this.timer = element;
        this.isRunning = isRunning;
        this.startTime = 0;
        this.overallTime = overallTime;
        this.interval = null;

        if (overallTime > 0 || this.isRunning) this.startTime = Date.now()

        this.updateDiv()
        if (this.isRunning) {
            this.updateTime()
        }
    }

    _getTimeElapsedSinceLastStart() {
        if (!this.startTime) return 0;
        
        return Date.now() - this.startTime;
    }

    toggle() {
        console.log("Test")
        if (!this.isRunning) {
            this.isRunning = true;
            this.timer.nextSibling.children[0].setAttribute("class", "fas fa-pause")

            this.startTime = Date.now();
            this.updateTime()
        } else {
            this.isRunning = false;
            this.timer.nextSibling.children[0].setAttribute("class", "fa fa-play")

            this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
            this.saveTime()
            clearInterval(this.interval)
        }
    }

    reset() {
        this.overallTime = 0;
        if (this.isRunning) {
            this.startTime = Date.now();
            return;
        }

        this.startTime = 0;
    }

    getTime() {
        if (!this.startTime) {
            return 0;
        }

        if (this.isRunning) {
            return this.overallTime + this._getTimeElapsedSinceLastStart();
        }

        return this.overallTime;
    }

    updateTime() {
        this.interval = setInterval(() => {
            this.updateDiv();
            this.saveTime()
        }, 100)
    }

    updateDiv() {
        const timeInSeconds = Math.round(this.getTime() / 1000);

        let sec = timeInSeconds % 60;
        let min = Math.floor(timeInSeconds / 60) % 60
        let hrs = Math.floor(timeInSeconds / 3600)

        if (sec < 10) {
            sec = '0' + sec
        }
        if (min < 10) {
            min = '0' + min
        }
        if (hrs < 10) {
            hrs = '0' + hrs
        }

        this.timer.innerText = hrs + ":" + min + ":" + sec
    }

    saveTime() {
        updateLocalActivityTime(this.timer, this.isRunning, this.overallTime)
    }

    getStatus() {
        if (this.isRunning) {
            return "fas fa-pause"
        } else return "fa fa-play"
    }
}

//Getting activities from local storage
function localActivityInit() {
    if (localStorage.getItem("activities") === null) {
        return []
    } else {
        return JSON.parse(localStorage.getItem("activities"))
    }
}

//Save new activity
function saveLocalActivities(activity) {
    let activities = localActivityInit()

    activities.push({"name": activity, "isRunning": false, "overallTime": 0})
    localStorage.setItem("activities", JSON.stringify(activities))
}

//Remove activity from local storage
function removeLocalActivity(activity) {
    let activities = localActivityInit()

    let activityIndex = activities.findIndex((element) => { return element.name === activity.parentElement.children[0].innerText })
    activities.splice(activityIndex, 1)
    localStorage.setItem("activities", JSON.stringify(activities))
}

//Update activities (isRunning, overallTime) in local storage
function updateLocalActivityTime (timer, isRunning, overallTime) {
    let activities = localActivityInit()

    let activity = activities.find((element) => { return element.name === timer.parentElement.children[0].innerText })

    activity.isRunning = isRunning
    activity.overallTime = overallTime

    localStorage.setItem("activities", JSON.stringify(activities))
}

//Load activities to DOM from local storage
function getActivities() {
    let activities = localActivityInit()

    activities.forEach((element) => {
        const activityDiv = document.createElement("div")
        activityDiv.classList.add("activity")

        // Activity name
        const newActivity = document.createElement("li")
        newActivity.innerText = element.name
        activityDiv.appendChild(newActivity)

        // Stopwatch
        const stopwatchDiv = document.createElement("div")
        stopwatchDiv.innerText = "00:00:00"
        stopwatchDiv.classList.add("timer")
        stopwatchDiv.stopwatch = new Timer(stopwatchDiv, element.isRunning, element.overallTime)
        activityDiv.appendChild(stopwatchDiv)

        // Stopwatch toggle button
        let icon = stopwatchDiv.stopwatch.getStatus()
        const toggleButton = document.createElement("button")
        toggleButton.innerHTML = `<i class="${icon}"></i>`
        toggleButton.classList.add("toggle-btn")
        toggleButton.addEventListener("click", toggleActivitySW)
        activityDiv.appendChild(toggleButton)

        // Reset stopwatch button
        const resetButton = document.createElement("button")
        resetButton.innerHTML = '<i class="fas fa-redo"></i>'
        resetButton.classList.add("reset-btn")
        resetButton.addEventListener("click", resetActivitySW)
        activityDiv.appendChild(resetButton)

        // Delete activity button
        const deleteButton = document.createElement("button")
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'
        deleteButton.classList.add("delete-btn")
        deleteButton.addEventListener("click", removeActivity)
        activityDiv.appendChild(deleteButton)


        //Adding the div to the activity list
        activityList.appendChild(activityDiv)

        //Resets input
        activityInput.value = ""
    })
}
