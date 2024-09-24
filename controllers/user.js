const { request } = require('http');

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
            // wifiMacAddress: os.networkInterfaces()['Wi-Fi'][0].mac,
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
            // wifiMacAddress: os.networkInterfaces()['Wi-Fi'][0].mac,
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
    
                    res.clearCookie('logintoken')
                    return res.end("Account Deleted \n we are filing sad for your bad experience")

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



// Reset Password
async function resetPassword(req, res) {


    // Functions ----------------------------------

    // Now make the OTP complex
    function makeOptComplext() {
        
        const inputOtp = Math.round(Math.random(10)*1000000)
        if (inputOtp) {
            
            // operation 1 : multiplication
            const result1 = inputOtp/Math.random()
            
            // operation 2 : addition
            const result2 = inputOtp + Math.random()
            
            // operation 3 : subtraction
            const result3 = inputOtp - Math.random()
            
            // operation 4 : division
            const result4 = inputOtp * Math.random()
            
    
            const result5 = inputOtp*Math.random()
    
            const tempOtp = Math.round(result1 + result2 + result3 + result4 + result5).toString()
            
            return tempOtp.slice(0, 6)
            
        } else {
            return "No input provided"
        }
        
    }

    console.log("POST request on verify email page..");


    const {email} = req.body;

    if (email) {
        
        console.log("Password Reset request to +" + email);
        
        // Import user for verify that user exists
        const { USER } = require('../models/user');
        const user = await USER.findOne({email: email})
        if (user) {
            console.log(user.accountStatus);
            if (user.accountStatus === 'active') {
                console.log("User is active, request will be forwarded");
                
                // Calling makeOtp function
                const finalOtp = makeOptComplext()
            
                console.log("Generated OTP :", finalOtp); // Send OTP to the user by email address
                const { otpArray } = require('../services/shorttermotpstore');
                otpArray.push(finalOtp)
            
                // Send OTP to email or mobile number or Registere mobile device
                
                const resHtml = `
                
                    <form action="/verifyemail/verifyotp" method="post">
                        <label for="otp">Enter OTP</label>
                        <input type="hidden" name="email" value="${email}">
                        <input type="number" name="userotp" id="userotp">
            
                        <button type="submit">Verify</button>
            
                    </form>
            
                `
            
                console.log("Body User :", user.id);
                
                req.body.requser = user.id
                console.log("User added to body :", req.body.requser);
                
                return res.send(resHtml)


            } else {
                console.log("User is not active, request will be rejected");
                return res.send("Account is Deleted")
                
            }
            
        } else {
            console.log("No user found with this email");
            return res.send("No user found with this email")
        }

    }


    

}




// Verify OTP
async function verifyOttp(req, res) {
    
    console.log("POST request on verify otp page..");

    const { userotp, email } = req.body

    const { otpArray } = require('../services/shorttermotpstore');

    console.log("Request at the user :", email);
    

    console.log(otpArray[0]);

    if (userotp === otpArray[0]) {
        console.log("OTP Verification Success");
        otpArray.shift() // Remove the first element of array

        const jwt = require('jsonwebtoken');
        const otptokenpasskey = 'vaibhav9999'
        const token = jwt.sign({ email }, otptokenpasskey, { expiresIn: '240s' });
        if (token) {
            
            res.cookie('otptoken', token) // set cookie for 1 hour
            console.log("User OTP token  :", token);
        }

        const responseHtml = `
        <h3>OTP Verified</h3>
        <form action="/resetpassword/changepassword" method="post">

        <input type="hidden" name="email" value="${email}">


        <label for="password">Enter new password</label>
        <input type="password" name="password" id="password">

        <label for="confirmPassword">Confirm password</label>
        <input type="password" name="confirmPassword" id="confirmPassword">

        <button type="submit">Reset Password</button>

    </form>
    
    `
        return res.send(responseHtml)
        
    } else {
        console.log("OTP Verification Failed");
        return res.send("OTP Verification Failed")
        
    }
}




// Change password
async function changePassword(req, res) {
    console.log("POST request on change password page..");

    const {password, confirmPassword, email} = req.body

    console.log("Password: " + password);
    console.log("Confirm Password: " + confirmPassword);
    console.log("Email: " + email);
    
    if (password === confirmPassword) {
        console.log("Passwords match..");
        
        console.log("OTP cookies: " + req.cookies.otptoken);
        const otpcookie = req.cookies.otptoken
        if (!otpcookie) {
            console.log("No otpcookie----------------");
            return res.send("You have to verify your OTP again, This is for security reasons");
        } else {
            console.log("otpcookie found----------------");
            
            const jwt = require('jsonwebtoken');

            try {
                const otptokenpasskey = 'vaibhav9999'
                const decoded = jwt.verify(otpcookie, otptokenpasskey);
                console.log("Decoded : ",decoded);
    
                if (decoded && decoded.email === email) {
    
                    console.log("OTP cookie matched with email");
                    console.log("OTP verified successfully");
                    // Update password in database
                    const { USER } = require('../models/user');
                    // Add hashed password when hashing completed
                    
                    const user = await USER.findOneAndUpdate({email: email}, {password: password})
            
                    res.clearCookie('otptoken')
                    
            
                    const resHtml = `
                        
                        <h2>Password changed successfully</h2>
                        <p> Go to login page </p>
                        <a href="/login">Login Here</a>
                        `
                    return res.send(resHtml)
    
                } else {
                    console.log("OTP verification failed");
                    return res.send("OTP verification failed")
                }
                
            } catch (err) {
                console.log(err.name);
            if (err.name === 'TokenExpiredError') {
                console.log("Error ->",err.name);
                res.clearCookie('otptoken')
                return res.send('Time out, verify again');
            }
            }
        }
    } else {
        console.log("Passwords do not match..");
        return res.send("Passwords do not match..")
    }
}





module.exports = {
    userSignup,
    userLogin,
    deleteUser,
    resetPassword,
    verifyOttp,
    changePassword

}