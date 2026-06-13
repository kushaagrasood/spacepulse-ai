const {
  askAI
} = require("./services/aiService");

(async () => {

  try {

    const result =
      await askAI(
        "Can astronauts see auroras from space?"
      );

    console.log(result);

  } catch (err) {

    console.error(
      "ERROR:",
      err.message
    );

  }

})();