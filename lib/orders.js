var dates = require('./dates');
var inventory = require('./inventory');
var ledger = require('./ledger');

function dateKey(value) {
  if (!value) return null;
  var date = String(value).trim();
  var parts;
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    parts = date.split('-');
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    parts = date.split('/');
  } else {
    return null;
  }

  var year;
  var month;
  var day;
  if (date.indexOf('-') !== -1) {
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    day = parts[0];
    month = parts[1];
    year = parts[2];
  }

  var monthNumber = Number(month);
  var dayNumber = Number(day);
  var yearNumber = Number(year);
  if (monthNumber < 1 || monthNumber > 12 || dayNumber < 1 || yearNumber < 1) return null;
  var daysInMonth = [31, (yearNumber % 4 === 0 && (yearNumber % 100 !== 0 || yearNumber % 400 === 0)) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (dayNumber > daysInMonth[monthNumber - 1]) return null;

  return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2);
}

exports.add = function (db, orderData) {
  var order = {
    id: db.nextOrderId++,
    date: orderData.date || dates.today(),
    customer: orderData.customer || 'Walk-in',
    customerId: orderData.customerId || null,
    paymentMode: orderData.paymentMode || 'cash',
    status: orderData.status || 'completed',
    items: orderData.items || [],
    coupon: orderData.coupon || '',
    subtotal: orderData.subtotal,
    discount: orderData.discount,
    tax: orderData.tax,
    total: orderData.total
  };

  db.orders.push(order);
  return order;
};

exports.get = function (db, id) {
  for (var i = 0; i < db.orders.length; i++) {
    if (db.orders[i].id == id) return db.orders[i];
  }
  return null;
};

// Added Aug 2021 (Rohit): cancel an order and release its inventory
exports.cancel = function (db, id, reason) {
  var order = exports.get(db, id);
  if (!order) return { ok: false, error: 'Order not found' };
  if (order.status === 'cancelled') {
    return { ok: false, error: 'Order #' + order.id + ' is already cancelled' };
  }

  order.status = 'cancelled';
  order.cancelledAt = dates.today();
  order.cancelReason = reason || 'Cancelled by operator';

  // Return items to stock
  inventory.release(db.products, order.items);

  // If billed to customer khata, reverse the debit on their credit account
  if (order.paymentMode === 'khata' && order.customerId) {
    ledger.reverseOrderDebit(db, order.customerId, order.total);
  }

  return { ok: true, order: order };
};

// Lists orders with optional search, status, and date range filters (newest first)
exports.list = function (db, filters) {
  var opts = filters || {};
  var list = db.orders.slice();

  if (opts.status && opts.status !== 'all') {
    list = list.filter(function (o) {
      return (o.status || 'completed') === opts.status;
    });
  }

  if (opts.search) {
    var q = String(opts.search).toLowerCase().trim();
    list = list.filter(function (o) {
      var idMatch = String(o.id).indexOf(q) !== -1;
      var custMatch = String(o.customer || 'Walk-in').toLowerCase().indexOf(q) !== -1;
      var couponMatch = String(o.coupon || '').toLowerCase().indexOf(q) !== -1;
      return idMatch || custMatch || couponMatch;
    });
  }

  if (opts.from) {
    var fromKey = dateKey(opts.from);
    if (fromKey) {
      list = list.filter(function (o) {
        var orderKey = dateKey(o.date);
        return orderKey && orderKey >= fromKey;
      });
    }
  }

  if (opts.to) {
    var toKey = dateKey(opts.to);
    if (toKey) {
      list = list.filter(function (o) {
        var orderKey = dateKey(o.date);
        return orderKey && orderKey <= toKey;
      });
    }
  }

  // newest first
  return list.sort(function (a, b) {
    var aKey = dateKey(a.date);
    var bKey = dateKey(b.date);
    if (!aKey) return bKey ? 1 : 0;
    if (!bKey) return -1;
    return aKey < bKey ? 1 : (aKey > bKey ? -1 : 0);
  });
};
