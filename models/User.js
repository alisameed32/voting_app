const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    nationalId: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'voter'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', async function(next){
    const user = this;

    // Hash the password if only its modified (or is new)
    if(!user.isModified('password')) return next();

    try {
        // generate salt
        const salt = await bcrypt.genSalt(10);

        // hash the pass
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Override the plain password with the hashed one
        user.password = hashedPassword;

        next();
    } catch (e) {
        next(e);
    }
})

userSchema.methods.comparePassword = async function(password){
    try{
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (e) {
        throw e;
    }
}

const User = mongoose.model("User", userSchema, "User");
module.exports = User;