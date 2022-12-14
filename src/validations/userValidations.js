const { body } = require('express-validator');
const fs = require("fs");
const path = require("path");
const userController = require('../controllers/userController');
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");


//Modelos
const User = db.User;

module.exports = { 

    registerValidation : [
        
        body("email")
        .notEmpty().withMessage("Campo email incompleto")
        .isEmail()
        .withMessage("Debe ingresar un email valido")
        .custom(async function(value, {req}){
            try {
            
            let usuarioEncontrado = await User.findOne({ where: { email:value}})
                
            if (usuarioEncontrado){ 
                return false;
            }
            else {
                return true;
            }
            }
            catch (err) {
                res.send(err);
                }
                
         }).withMessage("El email que ingresó se encuentra tomado"),
        
        body("user").
        notEmpty().withMessage("Campo de usuario incompleto")
        .custom(async function(value, {req}){
            try {
            let usuarioEncontrado = await User.findOne({ where: { username:value}})

            if (usuarioEncontrado){ 
                return false;
            }
            else {
                return true;
            }
            }
            catch (err) {
                res.send(err);
                }
          }).withMessage("El usuario que ingresó se encuentra tomado"),
        body("password").notEmpty().withMessage("Campo password incompleto")
        ]
        ,
    loginValidation :  [
        body("email").notEmpty().withMessage("Campo email incompleto").isEmail().withMessage("Debe ingresar un email valido"),
        body("password").notEmpty().withMessage("Campo password incompleto")]
        }
    
