const { expect } = require("expect");
const { isEven, handler, handlerWithNewDynamo } = require("./isEven");
const AWS = require("aws-sdk-mock");

AWS.mock("DynamoDB", "scan", function (params, callback) {
  callback(null, { Count: 1 });
});

AWS.mock("DynamoDB", "getItem", function (params, callback) {
  callback(null, {
    Item: { id: { N: "0" }, ad: { S: "You are a beautiful person!" } },
  });
});

test("isEven works for small numbers", () => {
  expect(isEven(2n)).toBe(true);
  expect(isEven(3n)).toBe(false);
  expect(isEven(123n)).toBe(false);
  expect(isEven(124n)).toBe(true);
});

test("isEven works for large numbers", () => {
  expect(
    isEven(
      20000000000000000000000000000000000000000000000000000000000000000000000000000002n
    )
  ).toBe(true);
  expect(
    isEven(
      33333333333333333333333333333333333333333333333333333333333333333333333333333333n
    )
  ).toBe(false);
  expect(
    isEven(
      12333333333333333333333333333333333333333333333333333333333333333333333333333333n
    )
  ).toBe(false);
  expect(
    isEven(
      12444444444444444444444444444444444444444444444444444444444444444444444444444444n
    )
  ).toBe(true);
});

test("handler succeeds on good input", async () => {
  const getResponse = await handlerWithNewDynamo({
    rawPath: "/123",
  });
  const postResponse = await handlerWithNewDynamo({
    rawPath: "/",
    body: 2,
  });
  expect(getResponse.statusCode == 200);
  expect(getResponse.isEven == false);
  expect(getResponse.ad == "You are a beautiful person!");
  expect(postResponse.statusCode == 200);
  expect(postResponse.isEven == true);
  expect(postResponse.ad == "You are a beautiful person!");
});

test("handler errors on bad input", async () => {
  const getResponse = await handlerWithNewDynamo({
    rawPath: "/123abc",
  });
  const postResponse = await handlerWithNewDynamo({
    rawPath: "/",
    body: "abc",
  });
  expect(getResponse.statusCode == 400);
  expect(postResponse.statusCode == 400);
});
