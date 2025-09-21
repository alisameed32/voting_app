const Candidate = require('./../models/Candidate');
const User = require('./../models/User');
const express = require('express');
const {route} = require("express/lib/application");
const {jwtAuthMiddleware} = require('./../jwt');
const router = express.Router();


const checkAdmin = async (userId) => {
    try{
        const user = await User.findById(userId);
        if( user.role === 'admin'){
            return true;
        }
    } catch (e){
        return false;
    }
}

const checkVoter = async (userId) => {
    try{
        const user = await User.findById(userId);
        if( user.role === 'voter'){
            return true;
        }
    } catch (e){
        return false;
    }
}


router.post('/', jwtAuthMiddleware, async (req, res) => {
    try{
        const userId = req.user.id;
        const isAdmin = await checkAdmin(userId);

        if (isAdmin){
            const data = req.body;
            const newCandidate = new Candidate(data);

            const response = await newCandidate.save();

            res.status(200).json(response);
        } else {
            console.log("You are Unathorized");
            res.status(401).json({message: 'Unathorized'});
        }




    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.put('/:candidateId', jwtAuthMiddleware, async (req, res)=>{
    try{
        const userId = req.user.id;
        const isAdmin = await checkAdmin(userId);

        if (isAdmin){
            const id = req.params.CandidateId;
            const data = req.body;
            const response = await Candidate.findOneAndUpdate(id, data, {
                new: true,
                runValidators: true
            });

            if(!response){
                res.status(404).json({ error: 'Candidate not found' });
            }

            console.log('Candidate data Updated');
            res.status(200).json(response);
        } else {
            console.log("You are Unathorized");
            res.status(401).json({message: 'Unathorized'});
        }

    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.delete('/:candidateId', jwtAuthMiddleware, async (req, res)=>{
    try{
        const userId = req.user.id;
        const isAdmin = await checkAdmin(userId);

        if (isAdmin){
            const id = req.params.candidateId;
            const response = await  Candidate.findOneAndDelete(id);

            if(!response){
                res.status(404).json({ error: 'Candidate not found' });
            }

            console.log('Candidate data Deleted');
            res.status(200).json(response);
        } else {
            console.log("You are Unathorized");
            res.status(401).json({message: 'Unathorized'});
        }


    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.get('/', async (req, res) => {
    try{
        const candidates = await Candidate.find({}, "name party");

        console.log("Data fetched");
        res.status(200).json(candidates);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.get('/vote/counts', async (req, res) => {
    try{
        const candidates = await Candidate.find({}, "name party voteCount").sort({voteCount: 'desc'});

        console.log("Data fetched");
        res.status(200).json(candidates);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{
        const candidateId = req.params.candidateId;
        const userId = req.user.id;
        const isVoter = await checkVoter(userId);

        if(isVoter){
            const candidate = await Candidate.findById(candidateId);
            const user = await User.findById(userId);

            if(!candidate){
                return res.status(404).json({ error: 'Candidate not found' });
            }

            if(!user){
                return res.status(404).json({ error: 'User not found' });
            }

            if(user.isVoted){
                return res.status(404).json({ error: 'You cannot vote because you already voted'});
            }

            candidate.votes.push(
                {user: userId}
            )

            candidate.voteCount += 1;
            user.isVoted = true;

            await candidate.save();
            await user.save();

            res.status(200).json({message: 'You voted succesfully'});


        } else {
            console.log("You are not voter");
            res.status(401).json({message: 'Not Voter'});
        }



    } catch (e){
        console.error(e);
        res.status(500).json({error: 'Internal Server Error'});
    }
})


module.exports = router;