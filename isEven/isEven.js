module.exports.handler = async (event) => {
  const query = getQueryFromEvent(event);
  const queryAsNumber = Number(query);

  if (isNaN(queryAsNumber)) {
    logInvalidEvent(event);
    return errorResponse(query);
  }

  const answer = isEven(queryAsNumber);

  return successResponse(query, answer);
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
  return query % 2 == 0;
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
