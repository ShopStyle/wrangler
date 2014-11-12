Package.describe({
  summary: "Assembla Package"
});

Package.on_use(function(api) {
  api.add_files('assembla.js', 'server');
  if (api.export) {
    api.export('Assembla');
  }
});
