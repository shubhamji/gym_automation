const mongoose = require('mongoose');
const UserCredsSchema = new mongoose.Schema({
    email: String,
    password: String
});
// { type : String , unique : true}
const UserRegistrationSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    address: String,
    dob: String,
    mobile: String
});

const MemberRegistrationSchema = new mongoose.Schema({
    email: String,
    name: String,
    address: String,
    dob: String,
    mobile: String,
    timing: String
});
const USER_OTP = new mongoose.Schema({
    otp: String,
    userEmail: String,
    expireAt: {
        type: Date,
        default: Date.now,
        index: { expires: '5m' },
    },
});

mongoose.model('user_creds', UserCredsSchema);
mongoose.model('user_reg', UserRegistrationSchema);
mongoose.model('members_reg', MemberRegistrationSchema);
mongoose.model('user_otp', USER_OTP);
