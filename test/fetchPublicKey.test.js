import test from "node:test";
import assert from "node:assert";
import { _extractVariables } from "../src/client/fetchPublicKey.js";

test("cgi/getParm samples where all 3 required fields are present", () => {
  const samples = [
    [
      "var userSetting=1;",
      'var ee="010100";',
      'var nn="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";',
      'var seq="111111111";',
      "$.ret=0;",
    ].join("\n"),
    [
      'var ee="010100";',
      'var nn="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";',
      'var seq="111111111";',
      "$.ret=0;",
    ].join("\n"),
    [
      'var ee="010100";',
      "var userSetting=1;",
      'var seq="111111111";',
      'var nn="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";',
      "$.ret=0;",
    ].join("\n"),
    [
      'var ee="010100";',
      'var seq="111111111";',
      'var nn="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";',
    ].join("\n"),
    [
      'var ee="010100";',
      'var nn="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";',
      "",
      'var seq="111111111";',
      "$.ret=0;",
    ].join("\n"),
    [
      'var ee="010100";',
      "",
      'var nn="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";',
      "",
      'var seq="111111111";',
      "",
      "",
      "",
      "",
      "",
      "$.ret=0;",
    ].join("\n"),
  ];

  const expected = {
    exponent: "010100",
    modulus:
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    sequence: "111111111",
  };

  for (const sample of samples) {
    assert.deepStrictEqual(_extractVariables(sample), expected);
  }
});
