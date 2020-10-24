const Discord = require('discord.js');
const fs = require('fs');
const readline = require('readline');
const { getVideoDurationInSeconds } = require('get-video-duration')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Get arguments
let arguments = process.argv.slice(2);
console.log(arguments);

// create a new Discord client
const client = new Discord.Client();

// Reference to the shadowrealm channel
let channelRef;

// Be able to counter others sending you to the shadow realm.
let canCounter = false;
let hasCountered = false;
let counterTarget;

// Don't let multiple people be shadowrealmed at once.
let isShadowRealmInProgress = false;
let connectionRef;

// Make protection against owner
let protectedUser;

let firstClipDuration = 0;
let secondClipDuration = 0;
let thirdClipDuration = 0;

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
    console.log('Ready!');
});


client.on('message', message => {
    if (message.content.startsWith("!setup")){
        console.log(message.content);

        let member = message.mentions.members.first()
        protectedUser = member;
        channelRef = member.voice.channel;

        fs.writeFile('./channel.json', JSON.stringify(channelRef), function (err) {
            if (err) {
                console.log('There has been an error saving your configuration data.');
                console.log(err.message);
                return;
            }
            console.log('Channel saved successfully.')
        });
    }

    if (message.content.startsWith("!shadowrealm")){
        if (isShadowRealmInProgress){
            return;
        }

        let member = message.mentions.members.first()
        let user = member.user;
        let temp = member.voice.channel;

        counterTarget = message.guild.member(message.author);


        if (member == protectedUser){
            temp.join().then(connection => {
                connection.play('./triggered-my-trap-card.mp3');

                setTimeout(() => {
                    counterTarget.voice.setChannel(channelRef, "Get Fukt, min bot er på min side.")
                    connection.disconnect();
                }, thirdClipDuration)
            })
            return;
        }

        isShadowRealmInProgress = true;
        canCounter = true;
        console.log(message.content);




        if (temp == null){
            console.log("Someone tried to murder me. See the above command");
            isShadowRealmInProgress = false;
            canCounter = false;
            return;
        }

        temp.join().then(connection => {


            connectionRef = connection;
            connection.play('./audiofile.webm');

            setTimeout(() => {

                if (!hasCountered){
                    member.voice.setChannel(channelRef, "You're going to the shadowrealm, Jimbo!")
                }

                connection.disconnect();

                canCounter = false;
                hasCountered = false;
                isShadowRealmInProgress = false;
            }, firstClipDuration)
        }).catch(err => console.log(err))
    }

    if (message.content.startsWith('!counter')){
        if (!isShadowRealmInProgress){
            return;
        }
        console.log(message.content);
        if (canCounter){
            hasCountered = true;
            connectionRef.play('./objection.webm');

            setTimeout(() => {
                counterTarget.voice.setChannel(channelRef, "You got countered, Dumbass.")
                connectionRef.disconnect();
            }, secondClipDuration)
        }
    }
});


// Try and setup channel from last setup
let data, myObj;
try{
    data = fs.readFileSync('./channel.json');
    console.log("Channel file read...")
    try {
        myObj = JSON.parse(data);
        console.dir(myObj);
        console.log("Channel successfully loaded from save");
        channelRef = myObj;
    }
    catch (err) {
        console.log('Error loading last saved channel, or channel does not exist.')
        console.log(err);
    }
}
catch{
    console.log("No previous save data was found.")
}

// Try and login with data from last time if no arguments was specified.
let key;

if (arguments.length === 0){
    try{
        data = fs.readFileSync('./key.txt', "utf-8");
        console.log("Key file read...")
        try {
            console.dir(data);
            if (data === ""){
                rl.question("Key was not specified, please enter manually: ", answer => {
                    key = answer;
                });
            }
            console.log("Key successfully loaded from save");
            key = data;
        }
        catch (err) {
            console.log('Error loading last saved key, or key does not exist.')
            console.log(err);
        }
    }
    catch{
        console.log("No previous save data was found.")
    }
}
else{
    key = arguments[0];
    fs.writeFile('./key.txt', key, function (err) {
        if (err) {
            console.log('There has been an error saving your configuration data.');
            console.log(err.message);
            return;
        }
        console.log('Key saved successfully.')
    });
}

let init = () => {
    getVideoDurationInSeconds('./audiofile.webm').then((duration) => {
        firstClipDuration = (duration * 1000) + 100;
    })
    getVideoDurationInSeconds('./objection.webm').then((duration) => {
        secondClipDuration = (duration * 1000) + 100;
    })
    getVideoDurationInSeconds('./triggered-my-trap-card.mp3').then((duration) => {
        thirdClipDuration = (duration * 1000) + 100;

    })
}

init();

// login to Discord with your app's token
client.login(key);




