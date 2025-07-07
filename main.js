const daysTag = document.querySelector(".days"),
    currentDate = document.querySelector(".day-name"),
    monthYear = document.querySelector("#monthYear"),
    prevNextIcon = document.querySelectorAll(".nav-controls .icons img"),
    timeValue = document.querySelector(".time-value"),
    decreaseBtn = document.querySelector("#decrease"),
    increaseBtn = document.querySelector("#increase"),
    dropdownIcon = document.querySelector(".dropdown-icon"),
    wrapper = document.querySelector(".wrapper");

let date = new Date(),
    currYear = parseInt(wrapper.dataset.currentYear),
    currMonth = parseInt(wrapper.dataset.currentMonth),
    currentTime = parseInt(wrapper.dataset.currentTime),
    selectedDate = null,
    isYearView = false,
    isDecadeView = false;

const { monthsShort, monthsFull, daysFull } = window.calendarData;

const renderCalendar = (direction = null) => {
    let liTag = "";
    const weeks = document.querySelector(".weeks");
    if (isDecadeView) {
        daysTag.classList.add("decade-view");
        daysTag.classList.remove("month-view", "year-view");
        weeks.style.display = "none";
        const startYear = Math.floor(currYear / 10) * 10;
        for (let i = startYear - 2; i <= startYear + 13; i++) {
            let isCurrentYear = i === currYear ? "active" : "";
            let isInactive = i < startYear || i > startYear + 9 ? "inactive" : "";
            liTag += `<li class="${isCurrentYear} ${isInactive}" data-year="${i}">${i}</li>`;
        }
        monthYear.innerText = `${startYear} - ${startYear + 9}`;
        currentDate.innerText = `${daysFull[date.getDay()]}, ${date.getDate()} ${monthsFull[currMonth]} ${currYear}`;
    } else if (isYearView) {
        daysTag.classList.add("year-view");
        daysTag.classList.remove("month-view", "decade-view");
        weeks.style.display = "none";
        for (let i = 0; i < 12; i++) {
            let isCurrentMonth = i === currMonth ? "active" : "";
            liTag += `<li class="${isCurrentMonth}" data-month="${i}">${monthsShort[i]}</li>`;
        }
        for (let i = 0; i < 4; i++) {
            liTag += `<li class="inactive" data-month="${i}">${monthsShort[i]}</li>`;
        }
        monthYear.innerText = `${currYear}`;
        currentDate.innerText = `${daysFull[date.getDay()]}, ${date.getDate()} ${monthsFull[currMonth]} ${currYear}`;
    } else {
        daysTag.classList.add("month-view");
        daysTag.classList.remove("year-view", "decade-view");
        weeks.style.display = "flex";
        let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
            lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
            lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay();

        liTag = "";
        for (let i = 0; i < firstDayofMonth; i++) {
            let lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();
            liTag += `<li class="inactive">${lastDateofLastMonth - (firstDayofMonth - i - 1)}</li>`;
        }

        for (let i = 1; i <= lastDateofMonth; i++) {
            let isToday = i === date.getDate() && currMonth === date.getMonth() 
                         && currYear === date.getFullYear() ? "active" : "";
            let isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === currMonth && selectedDate.getFullYear() === currYear ? "selected" : "";
            liTag += `<li class="${isToday} ${isSelected}" data-date="${i}">${i}</li>`;
        }

        let totalCells = firstDayofMonth + lastDateofMonth;
        for (let i = 1; i <= 42 - totalCells; i++) {
            liTag += `<li class="inactive">${i}</li>`;
        }

        monthYear.innerText = `${monthsShort[currMonth]} ${currYear}`;
        currentDate.innerText = `${daysFull[date.getDay()]}, ${date.getDate()} ${monthsFull[currMonth]} ${currYear}`;
    }
    
    daysTag.innerHTML = liTag;
    if (direction) {
        daysTag.classList.add(direction === "prev" ? "slide-down" : "slide-up");
        setTimeout(() => {
            daysTag.classList.remove(direction === "prev" ? "slide-down" : "slide-up");
        }, 300);
    }
}

const updateRealtime = () => {
    date = new Date();
    currYear = date.getFullYear();
    currMonth = date.getMonth();
    if (!isYearView && !isDecadeView && (date.getDate() !== new Date().getDate() || date.getMonth() !== new Date().getMonth() || date.getFullYear() !== new Date().getFullYear())) {
        renderCalendar();
    }
}

setInterval(updateRealtime, 60000);

daysTag.addEventListener("click", (e) => {
    const dayElement = e.target.closest("li");
        if (isDecadeView) {
            const year = parseInt(dayElement.getAttribute("data-year"));
            currYear = year;
            isDecadeView = false;
            isYearView = true;
            renderCalendar();
        } else if (isYearView) {
            const month = parseInt(dayElement.getAttribute("data-month"));
            currMonth = month;
            isYearView = false;
            selectedDate = null;
            renderCalendar();
        } else {
            const day = parseInt(dayElement.getAttribute("data-date"));
            const currentSelectedDate = selectedDate ? new Date(currYear, currMonth, selectedDate.getDate()) : null;
            const clickedDate = new Date(currYear, currMonth, day);

            if (currentSelectedDate && currentSelectedDate.getTime() === clickedDate.getTime()) {
                selectedDate = null;
                dayElement.classList.remove("selected");
            } else {
                const prevSelected = daysTag.querySelector(".selected");
                if (prevSelected) prevSelected.classList.remove("selected");
                selectedDate = clickedDate;
                dayElement.classList.add("selected");
            }
            renderCalendar();
        }
    }
);

monthYear.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isYearView) {
        isDecadeView = true;
        isYearView = false;
        renderCalendar();
    } else if (!isDecadeView) {
        isYearView = true;
        renderCalendar();
    }
});

currentDate.addEventListener("click", (e) => {
    e.stopPropagation();
    isYearView = false;
    isDecadeView = false;
    renderCalendar();
});

prevNextIcon.forEach(icon => {
    icon.addEventListener("click", () => {
        if (isDecadeView) {
            const startYear = Math.floor(currYear / 10) * 10;
            currYear = icon.id === "prev" ? startYear - 10 : startYear + 10;
            renderCalendar();
        } else if (isYearView) {
            currYear = icon.id === "prev" ? currYear - 1 : currYear + 1;
            renderCalendar();
        } else {
            currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;
            if (currMonth < 0 || currMonth > 11) {
                date = new Date(currYear, currMonth, date.getDate());
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            } else {
                date = new Date(currYear, currMonth, date.getDate());
            }
            selectedDate = null;
            renderCalendar(icon.id);
        }
    });
});

decreaseBtn.addEventListener("click", () => {
    if (currentTime > 5) {
        currentTime -= 5;
        timeValue.textContent = currentTime;
    }
});

increaseBtn.addEventListener("click", () => {
    currentTime += 15;
    timeValue.textContent = currentTime;
});

dropdownIcon.addEventListener("click", () => {
    const img = dropdownIcon.querySelector("img");
    const isCollapsed = wrapper.dataset.state === "collapsed";

    wrapper.dataset.state = isCollapsed ? "expanded" : "collapsed";
    dropdownIcon.dataset.state = isCollapsed ? "expanded" : "collapsed";

    img.src = isCollapsed ? "chevron_down.png" : "chevron_up.png";
});
