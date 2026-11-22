'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var ledger = require('../lib/ledger');

function makeDb() {
  return {
    customers: [{
      id: 1,
      name: 'Test Customer',
      openingBalance: 10,
      totalBilled: 90,
      totalSettled: 20,
      balance: 80
    }],
    nextSettlementId: 501
  };
}

test('string settlement amounts update totals and balance arithmetically', function () {
  var db = makeDb();

  var result = ledger.recordSettlement(db, 1, '5');

  assert.equal(result.ok, true);
  assert.equal(result.customer.totalSettled, 25);
  assert.equal(result.customer.balance, 75);
  assert.equal(result.settlement.amount, 5);
  assert.equal(result.settlement.mode, 'upi');
  assert.deepEqual(db.settlements, [result.settlement]);
  assert.equal(db.nextSettlementId, 502);
});

test('numeric settlement amount updates the balance arithmetically', function () {
  var db = makeDb();

  var result = ledger.recordSettlement(db, 1, 5);

  assert.equal(result.customer.totalSettled, 25);
  assert.equal(result.customer.balance, 75);
});

test('fractional-cent settlement amounts are rounded consistently in ledger and history', function () {
  var db = makeDb();

  var result = ledger.recordSettlement(db, 1, 5.678);

  assert.equal(result.customer.totalSettled, 25.68);
  assert.equal(result.customer.balance, 74.32);
  assert.equal(result.settlement.amount, 5.68);
});
