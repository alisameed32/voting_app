const User = require('./../models/User');
const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, genToken } = require('./../jwt');
const Candidate = require("../models/Candidate");


router.post('/signup', async (req, res) => {
    try{
        const data = req.body;
        const newUser = new User(data);

        const response = await newUser.save();
        console.log("User Created");

        const payLoad = {
            id: newUser.id,
            nationalId: newUser.nationalId,
            role: newUser.role
        }

        console.log(`Payload: ${payLoad}`);
        const token = genToken(payLoad);
        console.log("Token is: ", token);


        res.status(200).json({response: response, token: token});


    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.post('/login', async (req, res) => {
    try{
        const {nationalId, password} = req.body;

        const user = await User.findOne({nationalId: nationalId});

        if (!user || !(await user.comparePassword(password))){
            res.status(401).json({error: 'Invalid username or password'});
        }

        const payLoad = {
            id: user.id,
            nationalId: user.nationalId,
            role: user.role
        }

        const token = genToken(payLoad);

        res.status(200).json({ token });

    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


// User Profile

router.get('/profile', jwtAuthMiddleware, async  (req, res) => {
    try {
        const userId = req.user.id;

        // Find the user by id
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);

    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


// User Password Update

router.put('/profile/password', jwtAuthMiddleware, async  (req, res) => {
    try {
        const userId = req.user.id;
        const {currentPassword, newPassword} = req.body;

        const user = await User.findById(userId);

        if (!(await user.comparePassword(currentPassword))){
            res.status(401).json({error: 'Invalid password'});
        }

        user.password = newPassword;
        await user.save();

        console.log('User Password Updated');
        res.status(200).json({message: 'Password Updated', user: user});

    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



module.exports = router;