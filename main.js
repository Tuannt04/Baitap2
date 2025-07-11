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
    const today = new Date(); // Ngày hiện tại để so sánh

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
            let isToday = i === today.getDate() && currMonth === today.getMonth() 
                         && currYear === today.getFullYear() ? "active" : "";
            let isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === currMonth && selectedDate.getFullYear() === currYear ? "selected" : "";
            liTag += `<li class="${isToday} ${isSelected}" data-date="${i}">${i}</li>`;
        }

        let totalCells = firstDayofMonth + lastDateofMonth;
        for (let i = 1; i <= 42 - totalCells; i++) {
            liTag += `<li class="inactive">${i}</li>`;
        }

        monthYear.innerText = `${monthsShort[currMonth]} ${currYear}`;
    }
    
    // Hiển thị ngày hiện tại theo thời gian thực trong header (chỉ ngày, tháng, năm)
    currentDate.innerText = `${daysFull[today.getDay()]}, ${today.getDate()} ${monthsFull[today.getMonth()]} ${today.getFullYear()}`;
    
    daysTag.innerHTML = liTag;
    // Đảm bảo timeValue hiển thị số phút từ currentTime
    timeValue.textContent = `${currentTime} mins`;
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
    renderCalendar();
}

setInterval(updateRealtime, 10000);

daysTag.addEventListener("click", (e) => {
    const dayElement = e.target.closest("li");
    if (dayElement && !dayElement.classList.contains("inactive")) {
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
});

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
                date = new Date(currYear, currMonth, 1);
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            }
            selectedDate = null;
            renderCalendar(icon.id);
        }
    });
});

if (decreaseBtn) {
    decreaseBtn.addEventListener("click", () => {
        if (currentTime > 5) {
            currentTime -= 5;
            timeValue.textContent = `${currentTime}`;
        }
    });
}

if (increaseBtn) {
    increaseBtn.addEventListener("click", () => {
        currentTime += 15;
        timeValue.textContent = `${currentTime}`;
    });
}

if (dropdownIcon) {
    dropdownIcon.addEventListener("click", () => {
        const img = dropdownIcon.querySelector("img");
        const isExpanded = wrapper.dataset.state === "expanded";
        wrapper.dataset.state = isExpanded ? "collapsed" : "expanded";
        img.src = isExpanded ? "chevron_up.png" : "chevron_down.png";
    });
}
