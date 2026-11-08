function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

function getToday() {
  var day = new Date();
  day.setHours(0, 0, 0, 0);
  return day;
}

function addDays(date, days) {
  var day = new Date(date.getTime());
  day.setDate(day.getDate() + days);
  return day;
}

function formatDateKey(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
}

function getAvailableDates() {
  var today = getToday();
  var result = [];
  var i, day, key, isArchive;
  for (i = -7; i <= 7; i++) {
    day = addDays(today, i);
    key = formatDateKey(day);
    isArchive = day.getTime() < today.getTime();
    result.push({ date: day, key: key, isArchive: isArchive });
  }
  return result;
}

function isSessionArchive(dateKey, time) {
  var now = new Date();
  var today = getToday();
  var parts = dateKey.split('-');
  var y = +parts[0], m = +parts[1], d = +parts[2];
  var dayDate = new Date(y, m - 1, d);

  if (dayDate.getTime() < today.getTime()) return true;
  if (dayDate.getTime() > today.getTime()) return false;

  // сегодня — сравниваем время
  var tParts = time.split(':');
  var sessionDate = new Date(y, m - 1, d, +tParts[0], +tParts[1], 0, 0);
  return sessionDate.getTime() <= now.getTime();
}

function formatDateHuman(date) {
  var days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()] + ', ' + pad2(date.getDate()) + '.' + pad2(date.getMonth() + 1);
}

var SESSIONS_TIMES = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

function generateSeats() {
  var seats = [];
  var rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // 8 рядов
  var seatsPerRow = 10; // по 10 мест в ряду

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    for (var j = 1; j <= seatsPerRow; j++) {
      seats.push({
        id: row + j,      // например, "A1"
        row: row,         // "A"
        num: j            // 1
      });
    }
  }
  return seats;
}

// Сохраним сгенерированные места в глобальную переменную
var ALL_SEATS = generateSeats();