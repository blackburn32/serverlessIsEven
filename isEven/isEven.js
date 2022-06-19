const AWS = require("aws-sdk");
const globalDynamo = new AWS.DynamoDB();

const advertisementsTableName = "advertisements";

async function handleEvent(event, dynamo) {
  const query = getQueryFromEvent(event);
  if (isNumeric(query)) {
    const queryAsNumber = BigInt(query);

    const answer = isEven(queryAsNumber);
    const ad = await getAdFromDynamo(dynamo);

    return successResponse(query, answer, ad);
  } else {
    logInvalidEvent(event);
    return errorResponse(query);
  }
}

function getQueryFromEvent(event) {
  let query = event.rawPath.replace("/", "");
  if (!query) {
    query = event.body;
  }

  if (!query) {
    logInvalidEvent(event);
  }
  return query;
}

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}

function logInvalidEvent(event) {
  console.log("Invalid event: ", event);
}

async function getAdFromDynamo(dynamo) {
  const numberOfAdsRaw = await dynamo
    .scan({
      TableName: advertisementsTableName,
      Select: "COUNT",
    })
    .promise();
  const numberOfAds = Math.max(numberOfAdsRaw.Count, 1);
  const luckyAdId = Math.floor(Math.random() * numberOfAds);

  const adRaw = await dynamo
    .getItem({
      TableName: advertisementsTableName,
      Key: {
        id: { N: `${luckyAdId}` },
      },
    })
    .promise();
  return adRaw.Item.ad.S;
}

function errorResponse(query) {
  return {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Invalid query",
      query: query,
    }),
  };
}

function isEven(query) {
  return query % 2n == 0n;
}

function successResponse(query, isEven, ad) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isEven: `${isEven}`,
      query: query,
      ad: ad,
    }),
  };
}


module.exports.handlerWithNewDynamo = async (event) =>{
  const dynamo = new AWS.DynamoDB();
  return handleEvent(event, dynamo);
}
module.exports.handler = async (event) => {
  return handleEvent(event, globalDynamo);
};
module.exports.isEven = isEven;
