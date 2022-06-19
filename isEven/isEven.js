module.exports.handler = async (event) => {
  const query = getQueryFromEvent(event);
  if (isNumeric(query)) {
    const queryAsNumber = BigInt(query);

    const answer = isEven(queryAsNumber);

    return successResponse(query, answer);
  } else {
    logInvalidEvent(event);
    return errorResponse(query);
  }
};

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

function errorResponse(query) {
  return {
    statusCode: 400,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Invalid query`,
      query: query,
    }),
  };
}

function isEven(query) {
  return query % 2n == 0n;
}

function successResponse(query, isEven) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      isEven: `${isEven}`,
      query: query,
    }),
  };
}
