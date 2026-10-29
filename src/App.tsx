// callbackhell

function work(time, task, callback) {
  if (!time || !task) {
    return callback({ error: "time and task are required" });
  } else {
    setTimeout(() => {
      console.log("Work completed in time" + task);
      return null;
    }, time);
  }
}

work(2000, "Washing", (error) => {
  if (error) console.log(error.error);
  else {
    work(3000, "drying", (error) => {
      if (error) console.log(error.error);
      else {
        work(3000, "ironing", (error) => {
          if (error) console.log(error.error);
          else console.log("task completed!");
        });
      }
    });
  }
});


