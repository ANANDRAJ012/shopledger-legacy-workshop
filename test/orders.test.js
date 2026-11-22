'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var orders = require('../lib/orders');

function makeDb() {
  return {
    orders: [
      { id: 1, date: '02/02/2022' },
      { id: 2, date: '05/01/2022' },
      { id: 3, date: '15/01/2022' },
      { id: 4, date: '28/12/2021' }
    ]
  };
}

test('order history sorts DD/MM/YYYY dates newest first', function () {
  var result = orders.list(makeDb());

  assert.deepEqual(result.map(function (order) { return order.id; }), [1, 3, 2, 4]);
});

test('from-date filtering includes dates on or after the selected day', function () {
  var result = orders.list(makeDb(), { from: '2022-01-10' });

  assert.deepEqual(result.map(function (order) { return order.id; }), [1, 3]);
});

test('to-date filtering excludes dates after the selected day', function () {
  var db = {
    orders: [
      { id: 1, date: '02/02/2022' },
      { id: 2, date: '15/01/2022' },
      { id: 3, date: '25/01/2022' }
    ]
  };

  var result = orders.list(db, { to: '2022-01-20' });

  assert.deepEqual(result.map(function (order) { return order.id; }), [2]);
});

test('date filtering excludes orders with invalid calendar dates', function () {
  var db = {
    orders: [
      { id: 1, date: '15/01/2022' },
      { id: 2, date: '31/02/2022' }
    ]
  };

  var result = orders.list(db, { from: '2022-01-01' });

  assert.deepEqual(result.map(function (order) { return order.id; }), [1]);
});
