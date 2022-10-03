function equal(input1, input2, message) {
    expect(input1).toEqual(input2)
}

function equals(...args) {
    equal(...args)
}

function deepEqual(...args) {
    equal(...args)
}

function notEqual(input1, input2, message) {
    expect(input1).not.toEqual(input2)
}

function ok(input, message) {
    expect(input).toBeTruthy()
}

function notOk(input1, message) {
    expect(input1).toBeFalsy()
}

function plan(num) {
    // do nothing
}

function pass(message) {
    expect(1).toEqual(1)
}


function fail(message) {
    expect(1).toEqual(0)
}

function skip(message) {
    pass()
}

export default {
    equal, ok, plan, notOk, pass, notEqual, equals, fail, skip, deepEqual
}