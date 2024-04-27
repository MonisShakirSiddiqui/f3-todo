document.addEventListener("DOMContentLoaded", function () {
    const todayDiv = document.querySelector('.today');
    const futureDiv = document.querySelector('.future');
    const completedDiv = document.querySelector('.completed'); 

    const itemInput = document.getElementById('itemName');
    const priorityInput = document.getElementById('selectPriority');
    const dateInput = document.getElementById('calendar');
    const addItemBtn = document.querySelector('.btn');

    function compareDate(taskDate, todayDate) {
        const dateParts1 = taskDate.split('/');
        const dateObj1 = new Date(dateParts1[2], dateParts1[1] - 1, dateParts1[0]);

        const dateParts2 = todayDate.split('/');
        const dateObj2 = new Date(dateParts2[2], dateParts2[1] - 1, dateParts2[0]);

        return dateObj1 < dateObj2;
    }

    let tCount = 0, fCount = 0, cCount = 0;

    function render() {
        tCount = 0; fCount = 0; cCount = 0;
        todayDiv.innerHTML = '';
        futureDiv.innerHTML = '';
        completedDiv.innerHTML = '';
        
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        tasks.forEach((obj, idx) => {
            let { name, date, priority } = obj;
            let taskDiv = makeItem(name, priority, date);
            
            if (obj.completed == true) {
                addTaskToList(taskDiv, date, name, priority, true);
            } else {
                addTaskToList(taskDiv, date, name, priority, false);
                
                const today = new Date();
                const todayDateString = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                
                let isPending = compareDate(date, todayDateString);
                
                if (isPending) taskDiv.style.border = '3px solid red';
            }
        });
    }

    render();

    function reloadAtMidnight() {
        const currentTime = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); 
        const millisecondsUntilMidnight = midnight - currentTime + 1000;

        setTimeout(() => {
            location.reload();
        }, millisecondsUntilMidnight);
    }

    reloadAtMidnight();

    addItemBtn.addEventListener('click', (e) => {
        let itemName = itemInput.value;
        let priority = priorityInput.options[priorityInput.selectedIndex].textContent;
        let date = dateInput.value;
        
        if (itemName && priority && date) {
            let formattedDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            let taskDiv = makeItem(itemName, priority, formattedDate);
            addTaskToList(taskDiv, formattedDate, itemName, priority, false);

            let arr = JSON.parse(localStorage.getItem('tasks')) || [];
            let obj = {
                name: itemName,
                date: formattedDate,
                priority: priority,
                completed: false
            };
            arr.push(obj);
            localStorage.setItem('tasks', JSON.stringify(arr));
        } else {
            throw Error('Enter all values');
        }
    });

    function makeItem(itemName, priority, date) {
        let div = document.createElement('div');
        div.innerHTML = `
            <div class="taskItem name">${itemName}</div>
            <div class="taskItem">Priority: ${priority}</div>
            <div class="taskItem">${date}</div>
            <div id="taskIcon">
                <img src="images/check-circle.png" id="check" alt="mark complete">
                <img src="images/trash.png" id="trash" alt="delete">
            </div>
        `;
        
        const today = new Date();
        const todayDateString = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        let isPending = compareDate(date, todayDateString);
        
        if (isPending) div.style.border = '3px solid red';
        
        return div;
    }

    function addTaskToList(taskDiv, date, itemName, priority, completed) {
        let itemNameDiv = taskDiv.querySelector('.name');
        taskDiv.classList.add('task');
        
        const today = new Date();
        const todayDateString = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const parts = date.split('/');
        const formattedDate = `${parts[0]}/${parts[1]}/${parts[2]}`;

        const selectedDateString = formattedDate;

        let checkBtn = taskDiv.querySelector('#check');
        let trashBtn = taskDiv.querySelector('#trash');
        
        if (completed) {
            cCount++;
            itemNameDiv.innerText = `${cCount}. ` + itemNameDiv.innerText;
            completedDiv.append(taskDiv);
            checkBtn.classList.add('hide');
            taskDiv.style.color = 'black';    
            taskDiv.style.border = '2px solid black';
            taskDiv.style.backgroundColor = 'white';
            trashBtn.setAttribute('src', 'images/trash-black.png');
        } else {
            if (todayDateString === selectedDateString) {
                tCount++;
                itemNameDiv.innerText = `${tCount}. ` + itemNameDiv.innerText;
                todayDiv.append(taskDiv);
            } else {
                fCount++;
                itemNameDiv.innerText = `${fCount}. ` + itemNameDiv.innerText;
                futureDiv.append(taskDiv);
            }
        }

        addEventToBtns(checkBtn, trashBtn, taskDiv, itemName, priority, formattedDate);
    }

    function addEventToBtns(checkBtn, trashBtn, taskDiv, itemName, priority, date) {
        checkBtn.addEventListener('click', () => {
            completedDiv.appendChild(taskDiv);
            checkBtn.classList.add('hide');
            taskDiv.style.color = 'black';
            taskDiv.style.backgroundColor = 'white';
            taskDiv.style.border = '2px solid black';
            trashBtn.setAttribute('src', 'images/trash-black.png');
            
            let arr = JSON.parse(localStorage.getItem('tasks')) || [];
            for (let obj of arr) {
                if (obj.name === itemName) {
                    obj.completed = true;
                    break;
                }
            }
            localStorage.setItem('tasks', JSON.stringify(arr));
            render();
        });

        trashBtn.addEventListener('click', () => {
            taskDiv.remove();
            
            let arr = JSON.parse(localStorage.getItem('tasks')) || [];
            arr = arr.filter(obj => obj.name !== itemName);
            localStorage.setItem('tasks', JSON.stringify(arr));
            render();
        });
    }
});
