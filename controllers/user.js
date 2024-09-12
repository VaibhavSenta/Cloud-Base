// User Sign Up
async function userSignup(req, res) {
    console.log("Wellcome to login route");

    // Module imports
    const os = require('os');
    const { USER } = require('../models/user');
    const useragent = require('useragent');


    // Capture user agent string from request
    const userAgentString = req.header('User-Agent');

    // Parse the user agent string
    const agent = useragent.parse(userAgentString)

    console.log("POST request to sign up");
    const {userName, email, password, firstName, lastName, dob} = req.body;

    // New User
    const newUser = {
        userName: userName,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        
        signUpDeviceDetails: {
            hostName: os.hostname(),
            osUserName: os.userInfo().username,
            osMachineType: os.machine(),
            osName: os.type(),
            osPlatform: os.platform(),
            os: os.platform(),
            osVersion: os.release(),
            homeDirectory: os.homedir(),
            freeSystemMomory: os.freemem(),
            totalSystemMemory: os.totalmem(),
            deviceIp: req.ip,
            browser: req.headers['user-agent'],
            wifiMacAddress: os.networkInterfaces()['Wi-Fi'][0].mac,
            cpuArchitecture: os.arch(),
            cpuModel: os.cpus()[0].model,
            cpuSpeed: os.cpus()[0].speed,
            cpuCores: os.cpus().length,
            temDir: os.tmpdir(),
            browser: agent.toString(),
            browserVersion: agent.toVersion(),
            // deviceVersion: req.device.version,
            
        }

    }
    console.log("USER :", newUser);

    

    // Check User(Email)
    const checkUser = await USER.find({email: email}) // Check user will be array of users with given email
    console.log("Check user :", checkUser);
    
    // Check Username
    const checkUsername = await USER.find({userName: userName}) // Check user will be array of users with given username
    console.log("Check username : ",checkUsername);

    // Check unique User(Email)
    if (checkUser.length != 0) {
        console.log("User found in database");
        if (checkUser[0].accountStatus === 'active') {
            console.log("User alredy exist and ACTIVE \n Try different email");
            return res.send("User alredy exist and ACTIVE \n Try different email")
        } else {
            console.log("Account is DELETED, Try to recover it by varios options");
            return res.send("Seems like account is DELETED, Try to recover it by varios options or create different account using defferent email and username")
            
        }
    } else {
        console.log("User not found in database");

        // Ckeck Unique Username
        if (checkUsername.length != 0) {
            if (userName === checkUsername[0].userName) {
                console.log("USERNAME not available, try different");
                res.send("Username not available, try differen")
                return res.redirect('/signup')
            }
        } else {
            console.log("USERNAME is available, You can create account ",userName);

            // Create USER
            const user = await USER.create(newUser);
            return res.redirect('/login')
        }
    }

    
}


// User Login
async function userLogin(req, res) {

    // Import modules  & Node Modules
    const os = require('os');
    const useragent = require('useragent');
    const cookieParser = require('cookie-parser');
    const { USER, LOGINDEVICEDETAILS } = require('../models/user');



    // Capture user agent string from request
    const userAgentString = req.header('User-Agent');

    // Parse the user agent string
    const agent = useragent.parse(userAgentString)

    console.log("POST request to Login");
    const {email, password} = req.body;
    
    const user = await USER.findOne({email});
    console.log("THE login USER :",user);
    
    
    // Functions
    async function setCookie(email, userName) {
        
        // const { USER } = require('../models/user');
        // const cookieUser = await USER.findOne({ email: email });
        const jwt = require('jsonwebtoken');

        
        const payload = {
            email: email,
            userName: userName
        }
        console.log("Payload User is :",payload);
        const jwtpass = "vaibhav123"
        const jwtToken =  jwt.sign(payload, jwtpass, {expiresIn: '1h'})

        console.log("JWT Token is ;", jwtToken);


        return res.cookie('logintoken',jwtToken)
    }
    // Check if user is deleted
    async function isUSerDeleted(email) {
        
        
        const tempUser = await USER.findOne({email: email})
        if (tempUser.accountStatus === 'deleted') {
            return true;
        } else {
            return false;
        }
    }

    
    // Define that Login successfull or not
    let isLoginSuccessful = null;
    if (!user) {
        console.log("There is no user you are trying to login..");
        res.send("There is no user you are trying to login..")
    } else {


        const checkIfDeletedUser = (await (isUSerDeleted(email))).valueOf()
        
        if (checkIfDeletedUser === true) {
            
            console.log("Sprry but the user is deleted from database.............");

            isLoginSuccessful = false
            res.send("Sorry but the user is deleted from database")
        } else{
            console.log("Account found in database \n Checking password..");
            if (password === user.password) {
                console.log("Password Varified...");
                req.loginUser = user
                isLoginSuccessful = true

                // Set JWT token to cookie by calling function
                setCookie(email, user.userName)

                console.log("Locals data :", user.userName);
                res.redirect('/')
                console.log("Login COMPLATE, This will logout automatically after 1H");
                
            } else {
                console.log("You entered wrong pasword");
                res.send("You entered wrong pasword")
                isLoginSuccessful = false
            }
        }
    }


    // Get details about who trys to login         
    async function collectLoginDeviceDetails() {

        // Import modules & node Modules
        const os = require('os');
        const useragent = require('useragent');

        // Capture user agent string from request
        const userAgentString = req.header('User-Agent');

        // Parse the user agent string
        const agent = useragent.parse(userAgentString)
        
        // create detail object
        const loginDeviceDetails = {
            requestEmail: email,
            requestPassword: password,
            isLoginSuccessful: isLoginSuccessful,
            hostName: os.hostname(),
            osUserName: os.userInfo().username,
            osMachineType: os.machine(),
            osName: os.type(),
            osPlatform: os.platform(),
            os: os.platform(),
            osVersion: os.release(),
            homeDirectory: os.homedir(),
            freeSystemMomory: os.freemem(),
            totalSystemMemory: os.totalmem(),
            deviceIp: req.ip,
            wifiMacAddress: os.networkInterfaces()['Wi-Fi'][0].mac,
            cpuArchitecture: os.arch(),
            cpuModel: os.cpus()[0].model,
            cpuSpeed: os.cpus()[0].speed,
            cpuCores: os.cpus().length,
            temDir: os.tmpdir(),
            browser: agent.toString(),
            browserVersion: agent.toVersion(),
            // deviceVersion: req.device.version,
            
        }
        // console.log("USER :", loginDeviceDetails);

        
        const loginUser = await LOGINDEVICEDETAILS.create(loginDeviceDetails)
    }
    return collectLoginDeviceDetails()
}



// User Delete
async function deleteUser(req, res) {

    // Import modules & Node modules
    const { USER } = require('../models/user');
    
    const { profile } = req.params;
    const {email: reqemail, password: reqpassword} = req.body
    console.log(reqemail, reqpassword);

    const deletedUser = await USER.findOne({email: reqemail})

    let isDeletionSuccessful = null;

    if (!deletedUser) {
        console.log("There are no user you want to delete, The user is alredy deleted or never created");
        isDeletionSuccessful = false
    } else {
        
        if (deletedUser.userName === profile) {
            console.log("User name Matched..");
            
            if (deletedUser.accountStatus === 'deleted') {
                console.log("User alredy deleted from database..");
                
                // Deletion ststus
                isDeletionSuccessful = false

                res.json({msg: "Account alredy Deleted"})
            } else {


                console.log("User found to delete operation :", deletedUser);
    
                if (reqpassword === deletedUser.password) {
                    
                    console.log("Password verified \n Now you can delete Account");
                    const afterdelete = await USER.findOneAndUpdate({email: reqemail}, {accountStatus: 'deleted'})
                    
                    // Deletion status
                    isDeletionSuccessful = true
    
                    console.log("Aftere deleted :",afterdelete);
    
                    return res.send("Account Deleted \n we are filing sad for your bad experience")

                } else {
                    console.log("Wrong Password >>>>>>>");

                    return res.send(" - - - - -  - WRONG PASSWORD - - - - - ")
                }

            }
        } else {
            console.log("User name not matched");
            console.log("Someone trying to delete account from others profile which is :",profile);

            // Deletion ststus
            isDeletionSuccessful = false

            res.json({msg: "Delete request from unauthorized profile"})
        }

    }

    // Get details about who trys to login         
    async function collectDeleteDeviceDetails() {

        // Import modules & node Modules
        const os = require('os');
        const useragent = require('useragent');

        // Capture user agent string from request
        const userAgentString = req.header('User-Agent');

        // Parse the user agent string
        const agent = useragent.parse(userAgentString)
        
        // create detail object
        const deleteDetails = {

        }
        const deleteDeviceDetails = {
            requestEmail: reqemail,
            requestPassword: reqpassword,
            isDeletionSuccessful: isDeletionSuccessful,
            hostName: os.hostname(),
            osUserName: os.userInfo().username,
            osMachineType: os.machine(),
            osName: os.type(),
            osPlatform: os.platform(),
            os: os.platform(),
            osVersion: os.release(),
            homeDirectory: os.homedir(),
            freeSystemMomory: os.freemem(),
            totalSystemMemory: os.totalmem(),
            deviceIp: req.ip,
            wifiMacAddress: os.networkInterfaces()['Wi-Fi'][0].mac,
            cpuArchitecture: os.arch(),
            cpuModel: os.cpus()[0].model,
            cpuSpeed: os.cpus()[0].speed,
            cpuCores: os.cpus().length,
            temDir: os.tmpdir(),
            browser: agent.toString(),
            browserVersion: agent.toVersion(),
            // deviceVersion: req.device.version,
            
        }
        
        console.log("delete device details :", deleteDeviceDetails);
        
        const { DELETEDEVICEDETAILS } = require('../models/user');
        const deleteUser = await DELETEDEVICEDETAILS.create(deleteDeviceDetails)
    }
    return collectDeleteDeviceDetails()

}





module.exports = {
    userSignup,
    userLogin,
    deleteUser
}