

// Employees
const { ADMIN } = require('./admin/admin');
const { SESSION } = require('./admin/Session');
const { GLOBALCONFIG } = require('./admin/GlobalConfig');

// Main Dashboard
const { MANAGEDAPP } = require('./ManagedApp/ManagedApp');

// Drive storage model
const { STORAGE} = require('./Storage');

module.exports = {
  ADMIN,
  SESSION,
  GLOBALCONFIG,
  MANAGEDAPP,
  STORAGE,
}