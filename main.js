document.addEventListener("DOMContentLoaded", () => {
    const daysTag = document.querySelector(".days"),
        currentDate = document.querySelector(".day-name"),
        monthYear = document.querySelector("#monthYear"),
        prevNextIcon = document.querySelectorAll(".nav-controls .icons img"),
        timeValue = document.querySelector(".time-value"),
        decreaseBtn = document.querySelector("#decrease"),
        increaseBtn = document.querySelector("#increase"),
        dropdownIcon = document.querySelector(".dropdown-icon"),
        wrapper = document.querySelector(".wrapper"),
        focusBtn = document.querySelector(".focus-btn"),
        stopBtn = document.querySelector(".stop-btn");

    // Kiểm tra các phần tử
    if (!focusBtn || !stopBtn || !decreaseBtn || !increaseBtn || !timeValue || !wrapper) {
        console.error("Một hoặc nhiều phần tử không được tìm thấy:", {
            focusBtn, stopBtn, decreaseBtn, increaseBtn, timeValue, wrapper
        });
        return;
    }

    let todayDate = new Date(); // Biến mới: Ngày hiện tại thực tế, không thay đổi khi navigate
    let date = new Date(),
        currYear = date.getFullYear(),
        currMonth = date.getMonth(),
        currentTime = parseInt(wrapper.dataset.currentTime) || 30,
        selectedDate = null,
        isYearView = false,
        isDecadeView = false,
        timerInterval = null,
        isTimerRunning = false;

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
                let isSelected = selectedDate && selectedDate.getFullYear() === i ? "selected" : "";
                liTag += `<li class="${isCurrentYear} ${isInactive} ${isSelected}" data-year="${i}">${i}</li>`;
            }
            monthYear.innerText = `${startYear} - ${startYear + 9}`;
            currentDate.innerText = `${daysFull[todayDate.getDay()]}, ${todayDate.getDate()} ${monthsFull[todayDate.getMonth()]} ${todayDate.getFullYear()}`;
        } else if (isYearView) {
            daysTag.classList.add("year-view");
            daysTag.classList.remove("month-view", "decade-view");
            weeks.style.display = "none";
            for (let i = 0; i < 12; i++) {
                let isCurrentMonth = i === currMonth ? "active" : "";
                let isSelected = selectedDate && selectedDate.getMonth() === i && selectedDate.getFullYear() === currYear ? "selected" : "";
                liTag += `<li class="${isCurrentMonth} ${isSelected}" data-month="${i}">${monthsShort[i]}</li>`;
            }
            for (let i = 0; i < 4; i++) {
                liTag += `<li class="inactive" data-month="${i}">${monthsShort[i]}</li>`;
            }
            monthYear.innerText = `${currYear}`;
            currentDate.innerText = `${daysFull[todayDate.getDay()]}, ${todayDate.getDate()} ${monthsFull[todayDate.getMonth()]} ${todayDate.getFullYear()}`;
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
                let prevMonth = currMonth - 1;
                let prevYear = currYear;
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear--;
                }
                let day = lastDateofLastMonth - (firstDayofMonth - i - 1);
                let isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === prevMonth && selectedDate.getFullYear() === prevYear ? "selected" : "";
                liTag += `<li class="inactive ${isSelected}" data-date="${day}" data-month="${prevMonth}" data-year="${prevYear}">${day}</li>`;
            }

            for (let i = 1; i <= lastDateofMonth; i++) {
                let isToday = i === todayDate.getDate() && currMonth === todayDate.getMonth() 
                            && currYear === todayDate.getFullYear() ? "active" : "";
                let isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === currMonth && selectedDate.getFullYear() === currYear ? "selected" : "";
                liTag += `<li class="${isToday} ${isSelected}" data-date="${i}" data-month="${currMonth}" data-year="${currYear}">${i}</li>`;
            }

            let totalCells = firstDayofMonth + lastDateofMonth;
            for (let i = 1; i <= 42 - totalCells; i++) {
                let nextMonth = currMonth + 1;
                let nextYear = currYear;
                if (nextMonth > 11) {
                    nextMonth = 0;
                    nextYear++;
                }
                let isSelected = selectedDate && selectedDate.getDate() === i && selectedDate.getMonth() === nextMonth && selectedDate.getFullYear() === nextYear ? "selected" : "";
                liTag += `<li class="inactive ${isSelected}" data-date="${i}" data-month="${nextMonth}" data-year="${nextYear}">${i}</li>`;
            }

            monthYear.innerText = `${monthsShort[currMonth]} ${currYear}`;
            currentDate.innerText = `${daysFull[todayDate.getDay()]}, ${todayDate.getDate()} ${monthsFull[todayDate.getMonth()]} ${todayDate.getFullYear()}`;
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
        todayDate = new Date();
        if (!isTimerRunning) {
            timeValue.textContent = `${currentTime}`;
        }
        renderCalendar();
    }

    updateRealtime();
    setInterval(updateRealtime, 10000);

    // Thêm sự kiện cuộn chuột
    daysTag.addEventListener("wheel", (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        let direction = null;

        if (isDecadeView) {
            const startYear = Math.floor(currYear / 10) * 10;
            currYear = delta > 0 ? startYear + 10 : startYear - 10;
            direction = delta > 0 ? "next" : "prev";
        } else if (isYearView) {
            currYear = delta > 0 ? currYear + 1 : currYear - 1;
            direction = delta > 0 ? "next" : "prev";
        } else {
            currMonth = delta > 0 ? currMonth + 1 : currMonth - 1;
            if (currMonth < 0 || currMonth > 11) {
                date = new Date(currYear, currMonth, date.getDate());
                currYear = date.getFullYear();
                currMonth = date.getMonth();
            } else {
                date = new Date(currYear, currMonth, date.getDate());
            }
            selectedDate = null;
            direction = delta > 0 ? "next" : "prev";
        }
        renderCalendar(direction);
    });

    // Sự kiện click trên ngày
    daysTag.addEventListener("click", (e) => {
        const dayElement = e.target.closest("li");
        if (dayElement) {
            if (isDecadeView) {
                const year = parseInt(dayElement.getAttribute("data-year"));
                currYear = year;
                isDecadeView = false;
                isYearView = true;
                selectedDate = new Date(year, currMonth, selectedDate ? selectedDate.getDate() : 1);
                renderCalendar();
            } else if (isYearView) {
                const month = parseInt(dayElement.getAttribute("data-month"));
                currMonth = month;
                isYearView = false;
                selectedDate = new Date(currYear, month, selectedDate ? selectedDate.getDate() : 1);
                renderCalendar();
            } else {
                const day = parseInt(dayElement.getAttribute("data-date"));
                const month = parseInt(dayElement.getAttribute("data-month") || currMonth);
                const year = parseInt(dayElement.getAttribute("data-year") || currYear);
                const clickedDate = new Date(year, month, day);

                const currentSelectedDate = selectedDate ? new Date(selectedDate) : null;
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
                    date = new Date(currYear, currMonth, date.getDate());
                    currYear = date.getFullYear();
                    currMonth = date.getMonth();
                } else {
                    date = new Date(currYear, currMonth, date.getDate());
                }
                selectedDate = null;
                renderCalendar();
            }
        });
    });

    decreaseBtn.addEventListener("click", () => {
        if (currentTime > 5 && !isTimerRunning) {
            currentTime -= 5;
            timeValue.textContent = currentTime;
        }
    });

    increaseBtn.addEventListener("click", () => {
        if (!isTimerRunning) {
            currentTime += 5;
            timeValue.textContent = currentTime;
        }
    });

    dropdownIcon.addEventListener("click", () => {
        const img = dropdownIcon.querySelector("img");
        const isExpanded = wrapper.dataset.state === "expanded";

        wrapper.dataset.state = isExpanded ? "collapsed" : "expanded";
        img.src = isExpanded ? "chevron_up.png" : "chevron_down.png";
    });

    focusBtn.addEventListener("click", () => {
        if (timerInterval) return;
        const minutes = parseInt(timeValue.textContent);
        if (isNaN(minutes) || minutes <= 0) return;

        let secondsRemaining = minutes * 60;
        isTimerRunning = true;
        focusBtn.style.display = "none";
        stopBtn.style.display = "inline-block";

        const updateTimer = () => {
            if (secondsRemaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isTimerRunning = false;
                currentTime = minutes;
                timeValue.textContent = `${minutes}`;
                focusBtn.style.display = "inline-block";
                stopBtn.style.display = "none";
                return;
            }

            const minutesLeft = Math.floor(secondsRemaining / 60);
            const secondsLeft = secondsRemaining % 60;
            timeValue.textContent = `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
            secondsRemaining--;
        };

        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    });

    stopBtn.addEventListener("click", () => {
        clearInterval(timerInterval);
        timerInterval = null;
        isTimerRunning = false;
        const minutes = parseInt(timeValue.textContent.split(':')[0]) || currentTime;
        currentTime = minutes;
        timeValue.textContent = `${minutes}`;
        focusBtn.style.display = "inline-block";
        stopBtn.style.display = "none";
    });
});
