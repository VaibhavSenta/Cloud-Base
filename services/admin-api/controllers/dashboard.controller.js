


const dashboard = async (req, res, next) => {
    console.log("Main dashboard..");
    console.log("Collecting some data.....");
    
    
  try {
  } catch (err) {
    console.error("Error loading dashboard data", err);
    next(err);
  }
};
