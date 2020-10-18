const Discord = require('discord.js');
const fs = require('fs');
const readline = require('readline');

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

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
    console.log('Ready!');
});


client.on('message', message => {
    if (message.content.startsWith("!setup")){
        console.log(message.content);
        let member = message.mentions.members.first()
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
        console.log(message.content);

        let member = message.mentions.members.first()
        let user = member.user;
        let temp = member.voice.channel;

        temp.join().then(connection => {
            connection.play('./audiofile.webm');
            setTimeout(() => {
                member.voice.setChannel(channelRef, "You're going to the shadowrealm, Jimbo!")
                connection.disconnect();
            }, 4500)
        }).catch(err => console.log(err))
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



// login to Discord with your app's token
client.login(key);



