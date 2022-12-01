const express = require('express');
const https = require('https');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const md5 = require('md5');

require('dotenv').config();

const app = express();

mailchimp.setConfig({
    apiKey: process.env.API_KEY,
    server: process.env.SERVER,
});

app.use(express.urlencoded({extended: true}));

// to use our static css files
app.use(express.static("public"));
// us the static files from the folder named 'public'
app.get("/", function(req, res){
    // res.send("Welcome! Sign up for more if you liked reading this post!");
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res){

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;

    const listId = process.env.LIST_ID;

    const subscribingUser = {
        firstName: firstName,
        lastName: lastName,
        email: email
    };


    async function run() {
        // making a request to add list member to mailchimp audience list
        try {
            const response = await mailchimp.lists.addListMember(listId, {
                email_address: subscribingUser.email,
                status: "subscribed",
                merge_fields: {
                    FNAME: subscribingUser.firstName,
                    LNAME: subscribingUser.lastName
            }
        });

            // console.log(`Successfully added contact as an audience member. The contact's id is ${response.id}.`);

            res.sendFile(__dirname + "/success.html");

        } catch(e) {
            // console.log(e.response.text);
            const text = JSON.parse(e.response.text);
            // console.log(text.title);
            if(text.title === 'Member Exists') {
                res.sendFile(__dirname + "/alreadySubscribed.html")
            }
            //  else if(text.title === 'Invalid Resource'){
            //     res
            // }
            else {
                res.sendFile(__dirname + "/failure.html");
            }
            // res.send(e);
            // res.sendFile(__dirname + "/failure.html");
        }

    }



    run();
});

app.post("/failure", function(req, res) {
    res.redirect("/");
});

app.listen(3000, function(){
    console.log("server for newsletter is up");
});

