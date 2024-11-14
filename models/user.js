const mongoose = require('mongoose');

const useSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true,
        unique: true

    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    recoveryEmail: {
        type: String,
        required: false,
        default: 'not added',
        unique: false
    },

    password: {
        type: String,
        required: true

    },

    firstName: {
        type: String,
        required: true
        
    },

    lastName: {
        type: String,
        required: true

    },

    profilePic: {
        type: String,
        required: false,
        default: '../public//defaultLogos/DefaultProfilePic-90.png'
    },

    dob: {
        type: Date,
        required: true

    },
    
    countryCode: {
        type: String,
        required: false
    },

    phonenumber: {
        type: String,
        required: false,
        unique: true,
        default: 'not added'
    },

    accountStatus: {
        type: String,
        enum: ['active', 'deleted'],
        default: 'active',
        required: true
    },
    
    logedinDevices: {
        type: Array,
        default: [],
        required: false

    },

    signUpDeviceDetails: {
        type: Object,
        required: false,
        default: {}
        
    },

},{timestamps: true})

const loginRequestDetailsSchema = new mongoose.Schema({

    hostName: {
        type: String,
        required: false
    },
    osUserName: {
        type: String,
        required: false

    },
    isLoginSuccessful: {
        type: Boolean,
        required: false,
        default: null
    },
    osMachineType: {
        type: String,
        required: false
        
    },
    osName: {
        type: String,
        required: false

    },
    osPlatform: {
        type: String,
        required: false

    },
    os: {
        type: String,
        required: false

    },
    osVersion: {
        type: String,
        required: false

    },
    homeDirectory: {
        type: String,
        required: false

    },
    freeSystemMomory: {
        type: Number,
        required: false

    },
    totalSystemMemory: {
        type: Number,
        required: false

    },
    deviceIp: {
        type: String,
        required: false

    },
    wifiMacAddress: {
        type: String,
        required: false

    },
    cpuArchitecture: {
        type: String,
        required: false

    },
    cpuModel: {
        type: String,
        required: false

    },
    cpuSpeed: {
        type: Number,
        required: false

    },
    cpuCores: {
        type: Number,
        required: false
    },
    temDir: {
        type: String,
        required: false

    },
    browser: {
        type: String,
        required: false

    },
    browserVersion: {
        type: String,
        required: false

    }
    

},{timestamps: true})

const deleteRequestDetailsSchema = new mongoose.Schema({

    requestEmail: {
        type: String,
        required: false
    },
    requestPassword: {
        type: String,
        required: false
    },
    hostName: {
        type: String,
        required: false
    },
    osUserName: {
        type: String,
        required: false

    },
    isDeletionSuccessful: {
        type: Boolean,
        required: false,
        default: null
    },
    osMachineType: {
        type: String,
        required: false
        
    },
    osName: {
        type: String,
        required: false

    },
    osPlatform: {
        type: String,
        required: false

    },
    os: {
        type: String,
        required: false

    },
    osVersion: {
        type: String,
        required: false

    },
    homeDirectory: {
        type: String,
        required: false

    },
    freeSystemMomory: {
        type: Number,
        required: false

    },
    totalSystemMemory: {
        type: Number,
        required: false

    },
    deviceIp: {
        type: String,
        required: false

    },
    wifiMacAddress: {
        type: String,
        required: false

    },
    cpuArchitecture: {
        type: String,
        required: false

    },
    cpuModel: {
        type: String,
        required: false

    },
    cpuSpeed: {
        type: Number,
        required: false

    },
    cpuCores: {
        type: Number,
        required: false
    },
    temDir: {
        type: String,
        required: false

    },
    browser: {
        type: String,
        required: false

    },
    browserVersion: {
        type: String,
        required: false

    }
    

},{timestamps: true})


const USER = mongoose.model('USE',useSchema)
const LOGINDEVICEDETAILS = mongoose.model('loginDeviceDetails',loginRequestDetailsSchema)
const DELETEDEVICEDETAILS = mongoose.model('deletedDeviceDetails',deleteRequestDetailsSchema)

module.exports = {
    USER,
    LOGINDEVICEDETAILS,
    DELETEDEVICEDETAILS
}