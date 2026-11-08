function renderDates(dates, selectedKey) {
  var container = document.getElementById('dates_list');
  
  // Очищаем контейнер 
  container.innerHTML = '';

  // Проходимся по массиву дат
  for (var i = 0; i < dates.length; i++) {
    var item = dates[i];
    
    // 1. Создаем кнопку
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'date-btn';
    
    // 2. Текст кнопки
    btn.appendChild(document.createTextNode(formatDateHuman(item.date)));
    
    // 3. Сохраняем ключ в data-атрибут
    btn.setAttribute('data-key', item.key);

    // 4. Классы состояний
    if (item.isArchive) {
      btn.className += ' is-archive';
    }
    if (item.key === selectedKey) {
      btn.className += ' is-active';
    }

    // 5. Обработчик клика (замыкание)
    (function(key) {
      btn.onclick = function() {
        onDateSelect(key);
      };
    })(item.key);

    // 6. Добавляем в контейнер
    container.appendChild(btn);
  }
}

function renderSessions(selectedDateKey, selectedTime, bookings) {
  var container = document.getElementById('sessions_list');
  container.innerHTML = ''; // Очищаем перед отрисовкой

  // Если дата не выбрана, показываем заглушку
  if (!selectedDateKey) {
    container.innerHTML = '<span class="txt_time">Сначала выберите дату</span>';
    return;
  }

  // Проходимся по массиву SESSIONS_TIMES 
  for (var i = 0; i < SESSIONS_TIMES.length; i++) {
    var time = SESSIONS_TIMES[i];

    // 1. Создаем элемент для сеанса 
    var span = document.createElement('span');
    span.className = 'session-btn';
    span.appendChild(document.createTextNode(time));
    span.setAttribute('data-time', time);

    // 2. Определяем, прошел ли сеанс (архивный?)
    var isArchive = isSessionArchive(selectedDateKey, time); 
    
     if (isArchive) {
      span.className += ' is-archive';
    } else {
      span.className += ' is-active-time'; 
    }

    (function(selectedTimeStr) {
      span.onclick = function() {
        onSessionSelect(selectedTimeStr);
      };
    })(time);

    // 3. Подсвечиваем выбранный сеанс
    if (time === selectedTime) {
      span.className += ' is-selected';
    }

    // 4. Добавляем в контейнер
    container.appendChild(span);
  }
}

function renderHall(dateKey, time, bookings, isArchive) {
  var container = document.getElementById('hall');
  container.innerHTML = ''; // Очищаем зал

  // 1. Получаем список занятых мест для ЭТОГО сеанса
  var takenSeats = getTakenSeats(bookings, dateKey, time); 

  // 2. Начинаем собирать HTML.
  var fragment = document.createDocumentFragment();

  var currentRow = null; // Чтобы вовремя сделать перенос строки
  var rowContainer = null;

  for (var i = 0; i < ALL_SEATS.length; i++) {
    var seat = ALL_SEATS[i];

    // Если начался новый ряд — создаем контейнер для ряда
    if (seat.row !== currentRow) {
      currentRow = seat.row;
      rowContainer = document.createElement('div');
      rowContainer.className = 'hall-row';
      
      // Добавляем подпись ряда (A, B, C...)
      var rowLabel = document.createElement('span');
      rowLabel.className = 'row-label';
      rowLabel.textContent = currentRow;
      rowContainer.appendChild(rowLabel);
      
      fragment.appendChild(rowContainer);
    }

    // Создаем место
    var seatEl = document.createElement('div');
    seatEl.className = 'seat';
    seatEl.textContent = seat.num; // Пишем номер места
    seatEl.setAttribute('data-id', seat.id); // "A1"

    // 3. Определяем статус места
    var isTaken = takenSeats.indexOf(seat.id) !== -1;

    if (isTaken) {
      seatEl.className += ' is-taken';
      // Если место занято, но сеанс НЕ архивный — разрешаем клик для отмены
      if (!isArchive) {
        (function(seatId) {
          seatEl.onclick = function() {
            onSeatClick(seatId);
          };
        })(seat.id);
      }
    } else if (isArchive) {
      seatEl.className += ' is-archive';
    } else {
      seatEl.className += ' is-free';
      
      // Вешаем клик ТОЛЬКО на свободные места (и не в архиве)
      (function(seatId) {
        seatEl.onclick = function() {
          onSeatClick(seatId);
        };
      })(seat.id);
    }

    // Добавляем место в ряд
    rowContainer.appendChild(seatEl);
  }

  // 4. Вставляем всё в DOM за один раз
  container.appendChild(fragment);
}

function setHallStatus(text, isArchive) {
  var el = document.getElementById('hall_status');
  el.innerHTML = text;
  el.className = isArchive ? 'hall_status is-archive' : 'hall_status';
}
