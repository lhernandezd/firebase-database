const fs = require('fs');

const getData = function(filename) {
  let content;
  try {
    const data = fs.readFileSync(filename);
    content = JSON.parse(data);
  } catch {
    content = [];
  }
  return content;
};

const saveData = function(filename, content) {
  fs.writeFileSync(filename, JSON.stringify(content, null, 2), 'utf-8');
};

module.exports = {
  getData,
  saveData,
};
