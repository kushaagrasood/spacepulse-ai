const {
  generateSkyPlan
} = require("./services/skyPlanner");

(async () => {

  try {

    const result =
      await generateSkyPlan(
        "Chennai",
        "Clear",
        [
          "ISS",
          "Jupiter",
          "Saturn"
        ]
      );

    console.log(result);

  } catch (err) {

    console.error(err);
  }

})();