exports.get404 = (req, res) => {
  res
    .status(404)
    .render('404', {
      pageTitle: 'Page not found',
      path: null
    });
}

exports.getError = (err, req, res, next) => {
  res
    .status(err.httpStatusCode)
    .render('error', {
      isAuthenticated: req.session.isLoggedIn,
      pageTitle: `Error${err.httpStatusCode ? ' ' + err.httpStatusCode : ''}`,
      path: '/error'
    });
}