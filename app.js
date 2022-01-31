// Selectors
const activityInput = document.querySelector(".activity-input")
const activityButton = document.querySelector(".activity-button")
const activityList = document.querySelector(".activity-list")

// Event Listeners
document.addEventListener("DOMContentLoaded", getActivities)
activityButton.addEventListener("click", addActivity)

// Functions
function addActivity(event) {
    event.preventDefault()
    let activities = localActivityInit()
    var activityName = activityInput.value

    while (activities.find((element) => { return element.name === activityName}) != undefined) {
        activityName = activityName + " copy"
    }

    if (!activityName) return

    // Activity div
    const activityDiv = document.createElement("div")
    activityDiv.classList.add("activity")

    // Activity name
    const newActivity = document.createElement("li")
    newActivity.innerText = activityName
    activityDiv.appendChild(newActivity)

    //add activitie
    saveLocalActivities(activityName)

    // Stopwatch
    const stopwatchDiv = document.createElement("div")
    stopwatchDiv.innerText = "00:00:00"
    stopwatchDiv.classList.add("timer")
    stopwatchDiv.stopwatch = new Stopwatch(stopwatchDiv, 0, 0, 0)
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

    timer.stopwatch.toggleClock()
}

function resetActivitySW(event) {
    const item = event.target

    const timer = item.previousSibling.previousSibling

    timer.stopwatch.resetClock()
}

function removeActivity(event) {
    console.log(event.target)
    event.target.parentElement.remove()
    removeLocalActivity(event.target)
}

function Stopwatch(element, hr, min, sec) {
    this.timer = element
    this.hr = hr
    this.min = min
    this.sec = sec
    this.stoptime = true
    this.interval = null

    this.toggleClock = () => {
        if (this.stoptime) {
            this.stoptime = false
            this.timer.nextSibling.children[0].setAttribute("class", "fas fa-pause")

            this.clockCycle()
        } else {
            this.stoptime = true
            this.timer.nextSibling.children[0].setAttribute("class", "fa fa-play")
            clearTimeout(this.timeout)
        }
    }

    this.clockCycle = () => {
        if (this.stoptime) return

        this.sec = parseInt(this.sec)
        this.min = parseInt(this.min)
        this.hr = parseInt(this.hr)

        this.sec += 1

        if (this.sec == 60) {
            this.min += 1
            this.sec = 0
        }
        if (this.min == 60) {
            this.hr += 1
            this.min = 0
        }

        if (this.sec < 10) {
            this.sec = '0' + this.sec
        }
        if (this.min < 10) {
            this.min = '0' + this.min
        }
        if (this.hr < 10) {
            this.hr = '0' + this.hr
        }

        this.timer.innerText = this.hr + ":" + this.min + ":" + this.sec

        var that = this
        updateLocalActivityTime(this.timer, this.hr, this.min, this.sec)
        this.timeout = setTimeout(() => { that.clockCycle() }, 1000);
    }

    this.resetClock = () => {
        if (!this.stoptime) this.toggleClock()
        this.hr = 0
        this.min = 0
        this.sec = 0
        this.timer.innerHTML = "00:00:00"
        this.timeout = null
    }

}

function localActivityInit() {
    if (localStorage.getItem("activities") === null) {
        return []
    } else {
        return JSON.parse(localStorage.getItem("activities"))
    }
}
function saveLocalActivities(activity) {
    let activities = localActivityInit()

    activities.push({"name": activity, "hr": 0, "min": 0, "sec": 0})
    localStorage.setItem("activities", JSON.stringify(activities))
}

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
        let sec = parseInt(element.sec)
        let min = parseInt(element.min)
        let hr = parseInt(element.hr)

        if (sec < 10) {
            sec = '0' + sec
        }
        if (min < 10) {
            min = '0' + min
        }
        if (hr < 10) {
            hr = '0' + hr
        }
        stopwatchDiv.innerText = hr + ":" + min + ":" + sec
        stopwatchDiv.classList.add("timer")
        stopwatchDiv.stopwatch = new Stopwatch(stopwatchDiv, element.hr, element.min, element.sec)
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
    })
}

function removeLocalActivity(activity) {
    let activities = localActivityInit()

    let activityIndex = activities.findIndex((element) => { return element.name === activity.parentElement.children[0].innerText })
    activities.splice(activityIndex, 1)
    localStorage.setItem("activities", JSON.stringify(activities))
}

function updateLocalActivityTime (timer, hr, min, sec) {
    let activities = localActivityInit()

    let activity = activities.find((element) => { return element.name === timer.parentElement.children[0].innerText })

    activity.hr = hr
    activity.min = min
    activity.sec = sec

    localStorage.setItem("activities", JSON.stringify(activities))
}