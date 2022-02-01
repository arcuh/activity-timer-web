//Selectors
const activityPage = document.querySelector("#activity-page")
const activityInput = document.querySelector("#activity-input")
const activityButton = document.querySelector("#activity-button")
const activityList = document.querySelector("#activity-list")

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

    //Div for name
    const activityNameDiv = document.createElement("div")
    activityNameDiv.classList.add("activity-name") 

    //Initialise Activity Name
    const newActivity = document.createElement("li")
    newActivity.innerText = activityName
    activityNameDiv.appendChild(newActivity)

    const renameButton = document.createElement("button")
    renameButton.innerHTML = '<i class="fas fa-edit"></i>'
    renameButton.classList.add("rename-btn")
    renameButton.setAttribute("title", "Rename Activity")
    renameButton.addEventListener("click", showRenamePrompt)
    activityNameDiv.appendChild(renameButton)

    activityDiv.appendChild(activityNameDiv)

    //Add Activity To Local Storage
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
    toggleButton.setAttribute("title", "Start Timer")
    toggleButton.addEventListener("click", toggleActivitySW)
    activityDiv.appendChild(toggleButton)

    // Reset stopwatch button
    const resetButton = document.createElement("button")
    resetButton.innerHTML = '<i class="fas fa-redo"></i>'
    resetButton.classList.add("reset-btn")
    resetButton.setAttribute("title", "Reset Timer")
    resetButton.addEventListener("click", resetActivitySW)
    activityDiv.appendChild(resetButton)

    // Delete activity button
    const deleteButton = document.createElement("button")
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'
    deleteButton.classList.add("delete-btn")
    deleteButton.setAttribute("title", "Delete Activity")
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

function showRenamePrompt(event) {
    //Save activity
    let activity = event.target.previousSibling

    //Background dark overlay
    const overlay = document.createElement("div")
    overlay.classList.add("overlay")

    //Container for rename elements
    const renameDiv = document.createElement("div")
    renameDiv.classList.add("rename-container")

    //Container for text (titles)

    const renameTextDiv = document.createElement("div")
    renameTextDiv.setAttribute("id", "rename-text-container")

    const renameTitle = document.createElement("h2")
    const renameActivityName = document.createElement("h3")

    renameTitle.innerText = "Rename Activity"
    renameActivityName.innerText = "“" + activity.innerText + "”"
    renameTextDiv.appendChild(renameTitle)
    renameTextDiv.appendChild(renameActivityName)

    //Form for entering new name
    const renameForm = document.createElement("form")
    renameForm.setAttribute("id", "rename-form")

    const textInput = document.createElement("input")
    textInput.setAttribute("type", "text")
    textInput.setAttribute("id", "rename-input")
    textInput.setAttribute("placeholder", "Enter new activity name")

    const saveButton = document.createElement("button")
    saveButton.innerHTML = '<i class="fas fa-check"></i>'
    saveButton.setAttribute("type", "submit")
    saveButton.activity = activity
    saveButton.addEventListener("click", renameActivity)

    renameForm.appendChild(textInput)
    renameForm.appendChild(saveButton)

    renameDiv.appendChild(renameTextDiv)
    renameDiv.appendChild(renameForm)

    overlay.appendChild(renameDiv)
    overlay.addEventListener("click", deleteOverlay)

    activityPage.appendChild(overlay)
}

function renameActivity(event) {
    event.preventDefault()
    const item = event.target
    const newName = document.getElementById("rename-input").value

    if (!newName) return

    let activityName = item.activity.innerText

    item.activity.innerText = newName

    updateLocalActivityName(activityName, newName)

    deleteOverlay(event.target.parentElement.parentElement.parentElement)
}

function resetActivitySW(event) {
    const timer = event.target.parentElement.children[1]

    timer.stopwatch.reset()
}

function removeActivity(event) {
    clearInterval(event.target.parentElement.children[1].stopwatch.interval)
    event.target.parentElement.remove()
    removeLocalActivity(event.target)
}

function deleteOverlay(event) {
    var item = event.target
    if (!item) item = event
    if (item.classList[0] === "overlay") item.remove()
}

//TIMER CLASS AND LOGIC
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
        if (!this.isRunning) {
            this.start()
        } else {
            this.pause()
        }
    }

    start() {
        this.isRunning = true;
        this.timer.nextSibling.children[0].setAttribute("class", "fas fa-pause")
        this.timer.nextSibling.setAttribute("title", "Pause Timer")

        this.startTime = Date.now();
        this.updateTime()
    }

    pause() {
        this.isRunning = false;
        this.timer.nextSibling.children[0].setAttribute("class", "fa fa-play")
        this.timer.nextSibling.setAttribute("title", "Start Timer")

        this.overallTime = this.overallTime + this._getTimeElapsedSinceLastStart();
        this.saveTime()
        clearInterval(this.interval)
    }

    reset() {
        this.pause()
        this.overallTime = 0;
        if (this.isRunning) {
            this.startTime = Date.now();
            return;
        }

        this.startTime = 0;
        this.updateDiv()
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
            this.saveTime()
            this.updateDiv();
        }, 100)
    }

    updateDiv() {
        const timeInSeconds = Math.floor(this.getTime() / 1000);

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
        updateLocalActivityTime(this.timer, this.isRunning, this.getTime())
    }

    getIcon() {
        if (this.isRunning) {
            return "fas fa-pause"
        } else return "fa fa-play"
    }

    getStatus() {
        if (this.isRunning) {
            return "Pause"
        } else return "Start"
    }
}

//LOCAL STORAGE

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

    let activityIndex = activities.findIndex((element) => { return element.name === activity.parentElement.children[0].children[0].innerText })
    activities.splice(activityIndex, 1)
    localStorage.setItem("activities", JSON.stringify(activities))
}

function updateLocalActivityName(activityName, newName) {
    let activities = localActivityInit()

    let activity = activities.find((element) => { return element.name === activityName })

    activity.name = newName

    localStorage.setItem("activities", JSON.stringify(activities))
}

//Update activities (isRunning, overallTime) in local storage
function updateLocalActivityTime (timer, isRunning, overallTime) {
    let activities = localActivityInit()

    let activity = activities.find((element) => { return element.name === timer.parentElement.children[0].children[0].innerText })

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
        //Div for name
        const activityNameDiv = document.createElement("div")
        activityNameDiv.classList.add("activity-name") 

        //Initialise Activity Name
        const newActivity = document.createElement("li")
        newActivity.innerText = element.name
        activityNameDiv.appendChild(newActivity)

        const renameButton = document.createElement("button")
        renameButton.innerHTML = '<i class="fas fa-edit"></i>'
        renameButton.classList.add("rename-btn")
        renameButton.setAttribute("title", "Rename Activity")
        renameButton.addEventListener("click", showRenamePrompt)
        activityNameDiv.appendChild(renameButton)

        activityDiv.appendChild(activityNameDiv)

        // Stopwatch
        const stopwatchDiv = document.createElement("div")
        stopwatchDiv.innerText = "00:00:00"
        stopwatchDiv.classList.add("timer")
        stopwatchDiv.stopwatch = new Timer(stopwatchDiv, element.isRunning, element.overallTime)
        activityDiv.appendChild(stopwatchDiv)


        // Stopwatch toggle button
        let icon = stopwatchDiv.stopwatch.getIcon()
        let status = stopwatchDiv.stopwatch.getStatus()
        const toggleButton = document.createElement("button")
        toggleButton.innerHTML = `<i class="${icon}"></i>`
        toggleButton.classList.add("toggle-btn")
        toggleButton.setAttribute("title", `${status} Timer`)
        toggleButton.addEventListener("click", toggleActivitySW)
        activityDiv.appendChild(toggleButton)

        // Reset stopwatch button
        const resetButton = document.createElement("button")
        resetButton.innerHTML = '<i class="fas fa-redo"></i>'
        resetButton.classList.add("reset-btn")
        resetButton.setAttribute("title", "Reset Timer")
        resetButton.addEventListener("click", resetActivitySW)
        activityDiv.appendChild(resetButton)

        // Delete activity button
        const deleteButton = document.createElement("button")
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'
        deleteButton.classList.add("delete-btn")
        deleteButton.setAttribute("title", "Delete Activity")
        deleteButton.addEventListener("click", removeActivity)
        activityDiv.appendChild(deleteButton)


        //Adding the div to the activity list
        activityList.appendChild(activityDiv)

        //Resets input
        activityInput.value = ""
    })
}
