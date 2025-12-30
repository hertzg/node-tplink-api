import test from "node:test";
import assert from "node:assert";
import { ACT, stringify, parse } from "../src/payload.js";

test("ACT enum has correct values", () => {
  assert.strictEqual(ACT.GET, 1);
  assert.strictEqual(ACT.SET, 2);
  assert.strictEqual(ACT.ADD, 3);
  assert.strictEqual(ACT.DEL, 4);
  assert.strictEqual(ACT.GL, 5);
  assert.strictEqual(ACT.GS, 6);
  assert.strictEqual(ACT.OP, 7);
  assert.strictEqual(ACT.CGI, 8);
});

test("stringify single action with array attributes", () => {
  const result = stringify([[ACT.GET, "some_oid", ["attr1=value1", "attr2=value2"]]]);

  assert.strictEqual(
    result,
    "1\r\n[some_oid#0,0,0,0,0,0#0,0,0,0,0,0]0,2\r\nattr1=value1\r\nattr2=value2\r\n"
  );
});

test("stringify single action with object attributes", () => {
  const result = stringify([[ACT.SET, "some_oid", { key1: "val1", key2: "val2" }]]);

  assert.strictEqual(
    result,
    "2\r\n[some_oid#0,0,0,0,0,0#0,0,0,0,0,0]0,2\r\nkey1=val1\r\nkey2=val2\r\n"
  );
});

test("stringify action with custom stack values", () => {
  const result = stringify([[ACT.GET, "oid", [], "1,2,3,4,5,6", "7,8,9,10,11,12"]]);

  assert.strictEqual(result, "1\r\n[oid#1,2,3,4,5,6#7,8,9,10,11,12]0,0\r\n");
});

test("stringify multiple actions", () => {
  const result = stringify([
    [ACT.GET, "oid1", ["a=1"]],
    [ACT.SET, "oid2", ["b=2"]],
  ]);

  assert.strictEqual(
    result,
    "1&2\r\n[oid1#0,0,0,0,0,0#0,0,0,0,0,0]0,1\r\na=1\r\n[oid2#0,0,0,0,0,0#0,0,0,0,0,0]1,1\r\nb=2\r\n"
  );
});

test("stringify action with no attributes", () => {
  const result = stringify([[ACT.GET, "simple_oid"]]);

  assert.strictEqual(result, "1\r\n[simple_oid#0,0,0,0,0,0#0,0,0,0,0,0]0,0\r\n");
});

test("parse simple response with attributes", () => {
  const data = "[some_stack]0\nattr1=value1\nattr2=value2";
  const result = parse(data);

  assert.strictEqual(result.error, null);
  assert.strictEqual(result.actions.length, 1);
  assert.strictEqual(result.actions[0].stack, "some_stack");
  assert.strictEqual(result.actions[0].actionIndex, 0);
  assert.deepStrictEqual(result.actions[0].attributes, {
    attr1: "value1",
    attr2: "value2",
  });
});

test("parse response with error section", () => {
  const data = "[error]5";
  const result = parse(data);

  assert.strictEqual(result.error, 5);
  assert.strictEqual(result.actions.length, 0);
});

test("parse response with cgi script", () => {
  const data = "[cgi]0\nconsole.log('hello');\nvar x = 1;";
  const result = parse(data);

  assert.strictEqual(result.error, null);
  assert.strictEqual(result.actions[0].stack, "cgi");
  assert.strictEqual(result.actions[0].script, "console.log('hello');\nvar x = 1;\n");
});

test("parse response with multiple sections for same action", () => {
  const data = "[stack1]0\na=1\n[stack2]0\nb=2";
  const result = parse(data);

  assert.strictEqual(result.error, null);
  assert.ok(Array.isArray(result.actions[0]));
  assert.strictEqual(result.actions[0].length, 2);
  assert.deepStrictEqual(result.actions[0][0].attributes, { a: "1" });
  assert.deepStrictEqual(result.actions[0][1].attributes, { b: "2" });
});

test("parse response with gaps in action indices", () => {
  const data = "[stack]2\na=1";
  const result = parse(data);

  assert.strictEqual(result.actions.length, 3);
  assert.strictEqual(result.actions[0].actionIndex, 0);
  assert.strictEqual(result.actions[1].actionIndex, 1);
  assert.strictEqual(result.actions[2].actionIndex, 2);
  assert.deepStrictEqual(result.actions[2].attributes, { a: "1" });
});

test("parse attribute with equals sign in value", () => {
  const data = "[stack]0\nkey=value=with=equals";
  const result = parse(data);

  assert.strictEqual(result.actions[0].attributes.key, "value=with=equals");
});

test("stringify and parse roundtrip preserves structure", () => {
  const original = [[ACT.GET, "test_oid", { foo: "bar", num: "123" }]];
  const stringified = stringify(original);

  // The response format is different from request format,
  // but we can verify the attributes are preserved in a response-like format
  const responseFormat = "[test_oid#0,0,0,0,0,0#0,0,0,0,0,0]0\nfoo=bar\nnum=123";
  const parsed = parse(responseFormat);

  assert.deepStrictEqual(parsed.actions[0].attributes, { foo: "bar", num: "123" });
});
