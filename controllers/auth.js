exports.getLogin = (req, res) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn
  })
}

exports.postLogin = (req, res) => {
  req.session.isLoggedIn = true;
  req.session.user = req.user;
  req.session.save();
  res.redirect('/');
}

exports.postLogout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
}