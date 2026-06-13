const {
  getImpact
} = require("./services/impactEngine");

(async () => {

  try {

    const result =
      await getImpact(
        "pilot",
        "geomagnetic storm",
        8
      );

    console.log(result);

  } catch (err) {

    console.error(
      "ERROR:",
      err.message
    );

  }

})();