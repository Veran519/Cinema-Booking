var state = {
  selectedDateKey: null,   
  selectedTime: null,      
  bookings: {}             // данные из localStorage
};

function onDateSelect(dateKey) {
  // 1. Если кликнули по уже выбранной дате — ничего не делаем
  if (state.selectedDateKey === dateKey) {
    return;
  }

  // 2. Обновляем состояние
  state.selectedDateKey = dateKey;
  state.selectedTime = null; // Сбрасываем выбранный сеанс при смене даты!

  // 3. Перерисовываем список дат (чтобы подсветить новую активную дату)
  renderDates(getAvailableDates(), state.selectedDateKey);

  // 4. Перерисовываем сеансы (показываем сеансы для новой даты)
  renderSessions(state.selectedDateKey, state.selectedTime, state.bookings);

  // 5. Очищаем схему зала, так как сеанс ещё не выбран!
  var hallContainer = document.getElementById('hall');
  if (hallContainer) {
    hallContainer.innerHTML = ''; // Очищаем зал
  }
  
  // Ставим статус в блоке над залом, что нужно выбрать сеанс
  var statusContainer = document.getElementById('hall_status');
  if (statusContainer) {
    statusContainer.innerHTML = 'Выберите сеанс.';
    statusContainer.className = 'hall_status'; // Сбрасываем классы (например, архивный)
  }
}

function onSessionSelect(time) {
  // Если кликнули по уже выбранному сеансу — ничего не делаем
  if (state.selectedTime === time) {
    return;
  }

  // 1. Обновляем состояние
  state.selectedTime = time;

  // 2. Перерисовываем список сеансов (чтобы подсветить выбранный)
  renderSessions(state.selectedDateKey, state.selectedTime, state.bookings);

  // 3. Отрисовываем схему зала 
  var isArchive = isSessionArchive(state.selectedDateKey, state.selectedTime);
  
  if (isArchive) {
    setHallStatus('Сеанс: ' + state.selectedTime + '. Архивный сеанс — изменения недоступны.', true);
  } else {
    setHallStatus('Сеанс: ' + state.selectedTime + '. Выберите места.', false);
  }

  renderHall(state.selectedDateKey, state.selectedTime, state.bookings, isArchive);
}

function onSeatClick(seatId) {
  var dateKey = state.selectedDateKey;
  var time = state.selectedTime;

  // Защита: если вдруг кликнули, когда сеанс архивный
  if (isSessionArchive(dateKey, time)) return;

  // Получаем текущий список занятых мест
  var takenSeats = getTakenSeats(state.bookings, dateKey, time);
  
  // Проверяем, занято ли уже это место
  var isTaken = takenSeats.indexOf(seatId) !== -1;

  if (isTaken) {
    // Если занято (и это наше место) — отменяем бронь
    removeBooking(state.bookings, dateKey, time, seatId);
  } else {
    // Если свободно — бронируем
    addBooking(state.bookings, dateKey, time, seatId);
  }

  // Перерисовываем зал, чтобы отобразить изменения
  renderHall(dateKey, time, state.bookings, false);
  
  // Обновляем статус (считаем свободные места)
  var newTakenSeats = getTakenSeats(state.bookings, dateKey, time);
  var freeCount = ALL_SEATS.length - newTakenSeats.length;
  setHallStatus('Сеанс: ' + time + '. Свободно мест: ' + freeCount + ' из ' + ALL_SEATS.length, false);
}

document.addEventListener('DOMContentLoaded', function() {
  // 1. Загружаем брони 
  state.bookings = loadBookings(); 
  
  // 2. Выбираем сегодняшнюю дату по умолчанию
  var todayKey = formatDateKey(getToday());
  state.selectedDateKey = todayKey;
  
  // 3. Рисуем интерфейс
  renderDates(getAvailableDates(), state.selectedDateKey);
  renderSessions(state.selectedDateKey, state.selectedTime, state.bookings);
  
  // 4. Ставим начальный статус для зала
  setHallStatus('Выберите сеанс.', false);
});