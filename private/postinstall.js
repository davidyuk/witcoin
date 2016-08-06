var fs = require('fs'),
  ncp = require('ncp');

fs.mkdir('public', function(err){
  if (err && err.code != 'EEXIST')
    return console.error(err);

  ncp('node_modules/bootstrap-sass/assets/fonts', 'public/fonts', function(err) {
    if (err)
      return console.error(err);
  });
});
