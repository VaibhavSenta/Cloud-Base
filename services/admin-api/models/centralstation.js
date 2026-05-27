

// Employees
const { ADMIN } = require('./admin/admin');
const { SESSION } = require('./admin/Session');
const { GLOBALCONFIG } = require('./admin/GlobalConfig');

// Drive storage model
const { STORAGE} = require('./Storage');

// Shared Ecosystem Models (from local package)
const { USER, MANAGEDAPP, AUDITLOG } = require('schema-package');

module.exports = {
  ADMIN,
  SESSION,
  GLOBALCONFIG,
  MANAGEDAPP,
  STORAGE,
  AUDITLOG,
  USER,
}