module.exports.isAuth = function (req, res, next) {
    console.log(req.user)
    if(req.isAuthenticated()) return next();
    else res.redirect('/login');
}

module.exports.isAdmin = function (req, res, next) {
    if(req.isAuthenticated() && req.user.isAdmin) return next();
    else res.status(401).json('You are not authorized bro')
}