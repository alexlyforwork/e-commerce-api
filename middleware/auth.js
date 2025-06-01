const express = require('express');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json("You are not authenticated!");
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.status(403).json("You are not authorized to access this resource!");
}

module.exports = {
    isAuthenticated,
    isAdmin
};