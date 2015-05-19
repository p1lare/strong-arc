var LandingView = (function () {
  function LandingView() {
    this.landingTitle  = element(by.css('.landing-title'));
    this.composerAppCommand  = element(
      by.css('.sl-app a[ui-sref="composer"]'));

    this.openComposerView = function() {
      var self = this;
      browser.driver.wait(function() {
        return self.composerAppCommand.isPresent();
      }, 10000);
      self.composerAppCommand.click();
      browser.driver.wait(function() {
        return element(
          by.css('.ia-project-title-header-container')
        ).isPresent();
      }, 10000);
    };

    this.waitUntilLoaded = function() {
      browser.get('http://127.0.0.1:9800/#/');
      browser.driver.wait(function() {
        return browser.driver.getCurrentUrl().then(function(url) {
          return url === 'http://127.0.0.1:9800/#/';
        });
      }, 20000);
      browser.waitForAngular();
    };

    this.get = function() {
      browser.get('http://127.0.0.1:9800/#/');
    };
  }
  return LandingView;
})();

module.exports = LandingView;
