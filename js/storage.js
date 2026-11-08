var STORAGE_KEY = 'cinema_bookings_v1';

// 1. Загрузка броней из памяти
function loadBookings() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {}; // Если пусто, возвращаем пустой объект
    var data = JSON.parse(raw);
    return (data && typeof data === 'object') ? data : {};
  } catch (e) {
    console.error('Ошибка чтения из localStorage', e);
    return {};
  }
}

// 2. Сохранение броней в память
function saveBookings(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Ошибка записи в localStorage', e);
  }
}

// 3. Получить список занятых мест для конкретного сеанса
function getTakenSeats(bookings, dateKey, time) {
  if (bookings[dateKey] && bookings[dateKey][time]) {
    return bookings[dateKey][time]; // Возвращаем массив мест, например ["A1", "B5"]
  }
  return []; // Если броней нет, возвращаем пустой массив
}

// 4. Забронировать место
function addBooking(bookings, dateKey, time, seatId) {
  // Если для этой даты еще нет объекта — создаем
  if (!bookings[dateKey]) bookings[dateKey] = {};
  // Если для этого времени еще нет массива — создаем
  if (!bookings[dateKey][time]) bookings[dateKey][time] = [];
  
  // Добавляем место, если его там еще нет
  if (bookings[dateKey][time].indexOf(seatId) === -1) {
    bookings[dateKey][time].push(seatId);
    saveBookings(bookings); // Сохраняем в localStorage
  }
}

// 5. Отменить бронь
function removeBooking(bookings, dateKey, time, seatId) {
  if (bookings[dateKey] && bookings[dateKey][time]) {
    var seats = bookings[dateKey][time];
    var index = seats.indexOf(seatId);
    if (index !== -1) {
      seats.splice(index, 1); // Удаляем 1 элемент с позиции index
      saveBookings(bookings); // Сохраняем
    }
  }
}