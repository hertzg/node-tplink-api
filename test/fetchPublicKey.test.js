import test from "node:test";
import assert from "node:assert";
import { _extractVariables } from "../src/client/fetchPublicKey.js";

test("cgi/getParm samples where all 3 required fields are present", () => {
  const nnLine = `var nn="${"A".repeat(128)}";`;
  const eeLine = 'var ee="010100";';
  const seqLine = 'var seq="111111111";';
  const samples = [
    ["var userSetting=1;", eeLine, nnLine, seqLine, "$.ret=0;"],
    [eeLine, nnLine, seqLine, "$.ret=0;"],
    [eeLine, "var userSetting=1;", seqLine, nnLine, "$.ret=0;"],
    [eeLine, seqLine, nnLine],
    [eeLine, nnLine, "", seqLine, "$.ret=0;"],
    [eeLine, "", nnLine, "", seqLine, "", "", "", "", "", "$.ret=0;"],
    ["", eeLine, "", nnLine, "", seqLine, "", "", "", "", "", "$.ret=0;"],
    ["", "", nnLine, "", eeLine, seqLine, "", "", "", "", "", "$.ret=0;"],
    [nnLine, eeLine, seqLine],
    [seqLine, nnLine, eeLine],
    [eeLine, nnLine, seqLine],
    [eeLine, seqLine, nnLine],
  ];

  const expected = {
    exponent: "010100",
    modulus:
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    sequence: "111111111",
  };

  for (const sample of samples) {
    assert.deepStrictEqual(_extractVariables(sample.join("\n")), expected);
  }
});
