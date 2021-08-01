"use strict";

//modules
const fetch = require("node-fetch");
const Discord = require('discord.js');
const client = new Discord.Client();
const cheerio = require('cheerio');
const got = require('got');
const {spawn} = require("child_process");
//token
const {token, web_token} = process.env;
//files
const tip = require('./tip.js');
const keep_alive = require('./keep_alive.js');

const DB = require("replitdb-client");
const db = new DB();

const prefix = "t!";

/*
const webhookClient = new Discord.WebhookClient("783764766408704032", web_token);

//on ready
client.on('ready', () => {
 console.log(`Logged in as ${client.user.tag}!`);
 client.user.setActivity('Debug 4: The Segmentation Fault', { type: 'PLAYING' });
  setTimeout(function(){ 
    webhookClient.send("ALL HAIL TIMCHEN")
  }, 10800000);
});
*/

const {log} = console;
/*
command ideas
-vote for timchen image of the week
-
*/
//commands here
client.on('message', async message => {
  //args
  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();
  //return if bot
  if (message.author.bot) return;
  //help command
  if (message.content.toLowerCase() === prefix+"help") {
    const HelpEmbed = new Discord.MessageEmbed()
       .setTitle('Help')
       .addField("t!help", 'Shows this message')
       .addField("t!about", 'Info about the bot')
       .addField("t!gen_quote [starting word]", 'Generates a fake timchen quote starting with [starting word] using a markov chain')
       .addField("t!random", 'Random timchen photo from timchen.tk')
       .addField("t!meme","Sends a meme from r/ProgrammerHumor")
       .addField("t!praise","Praises timchen")
       .addField("t!xkcd [num]","Gets xkcd comic [num] if [num] is absent, sends latest. If [num] is random, gets random xkcd comic.")
       .setTimestamp()
       .setFooter(tip.tip());
    message.channel.send(HelpEmbed)
  }
  //commands in dev
  else if (message.content.toLowerCase() === prefix+"devcommands") {
    const dHelpEmbed = new Discord.MessageEmbed()
       .setTitle('Commands In Development. (unstable)')
       .addField("a timchen blashemizing filter", 'Will delete messages offending timchen when turned on')
       .addField("t!search [lang] [error]", 'gets doc on error. must be spelled right. py, cpp, ruby, rust are supported rn')
       .addField("economy","based on timchen reputation points")
       .setTimestamp()
       .setFooter(tip.tip());
    message.channel.send(dHelpEmbed)
  }
  //about command
  else if (message.content.toLowerCase().startsWith(prefix+"about")) {
    const SayEmbed = new Discord.MessageEmbed()
       .setTitle('About')
       .setDescription("Timchen Bot is the best bot for all aspiring bug makers")
       .addField("Bot Invite","[Here](https://discord.com/oauth2/authorize?client_id=728030180626661416&scope=bot&permissions=1812327489)")
       .addField("Bot Support Server","[Here](https://discord.gg/B7p3XXR)")
       .addField("Timchen Website","https://lordtim.repl.co")
       .setTimestamp()
       .setFooter(tip.tip());
			message.channel.send(SayEmbed);
  }
  // generate fake timchen quote
  else if (message.content.toLowerCase().startsWith(prefix+"gen_quote")) {
    if (!args.length) {
	  	return message.channel.send('error: no start word was provided')};
    const pythonProcess = spawn('python',["./quotes.py", args[0]]);
    pythonProcess.stdout.addListener('data',
		data => {
      const SayEmbed = new Discord.MessageEmbed()
       .setTitle('Fake Timchen Quote')
       .setDescription("timchen sez: " + data.toString())
       .setTimestamp()
       .setFooter(tip.tip());
			message.channel.send(SayEmbed);

	  	// clear the function attached
		 pythonProcess.stdout.removeAllListeners();
      });
	}
  else if (message.content.toLowerCase().startsWith(prefix+"random")) {
    fetch("https://lordtim.repl.co/api/random").then(function(response) {
     return response.json();
   }).then(function(jsonResponse) {
     let url = jsonResponse.url
     let desc = jsonResponse.desc
     const RandomEmbed = new Discord.MessageEmbed()
       .setTitle(desc)
       .setImage(url)
       .setTimestamp()
       .setFooter(tip.tip())
     message.channel.send(RandomEmbed);
   })
  }
  else if (message.content.toLowerCase().startsWith(prefix+"memes") || message.content.toLowerCase().startsWith(prefix+"meme")) {
    fetch("https://www.reddit.com/r/ProgrammerHumor/top.json").then(function(response) {
     return response.json();
   }).then(function(jsonResponse) {
     let n = Math.floor(Math.random() * (25))
     let data = jsonResponse.data.children[n].data
     let image = data.url
     let title = data.title
     let link = "https://reddit.com"+data.permalink
     //send embed with title as title, image as image, url as description, footer is tip
     const MemeEmbed = new Discord.MessageEmbed()
       .setTitle(title)
       .setDescription(link)
       .setImage(image)
       .setTimestamp()
       .setFooter(tip.tip());
     message.channel.send(MemeEmbed)
   })
  }
  else if (message.content.toLowerCase().startsWith(prefix+"xkcd")) {
      if (!args.length) {
        got('https://xkcd.com/info.0.json').then(response => {
         response = JSON.parse(response.body)
         const XkcdEmbed = new Discord.MessageEmbed()
           .setTitle(response["safe_title"])
           .setDescription(response["alt"])
           .setImage(response["img"])
           .setTimestamp()
           .setFooter(tip.tip());
         return message.channel.send(XkcdEmbed)
         })
      } else if (args[0] != "random") {
          let comic_num = args[0]
          got('https://xkcd.com/'+comic_num+'/info.0.json').then(response => {
           response = JSON.parse(response.body)
           const XkcdEmbed = new Discord.MessageEmbed()
             .setTitle(response["safe_title"])
             .setDescription(response["alt"])
             .setImage(response["img"])
             .setTimestamp()
             .setFooter(tip.tip());
           return message.channel.send(XkcdEmbed)
           }).catch(err => {
             return message.channel.send('Comic Number Not Found')
        });
      } else {
        got('https://xkcd.com/info.0.json').then(response => {
         response = JSON.parse(response.body)
         let num = response["num"]
         num = Math.floor(Math.random() * num) + 1  
         got('https://xkcd.com/'+num+'/info.0.json').then(response => {
           response = JSON.parse(response.body)
           const XkcdEmbed = new Discord.MessageEmbed()
             .setTitle(response["safe_title"])
             .setDescription(response["alt"])
             .setImage(response["img"])
             .setTimestamp()
             .setFooter(tip.tip());
           return message.channel.send(XkcdEmbed)
         })
      })
      }
  }
  else if (message.content.toLowerCase().startsWith(prefix+"search")) {
      if (!args.length) {
	    	return message.channel.send('error: no language')
      };
      let language = args[0]
      language = language.toLowerCase()
      if (args.length == 1) {
        return message.channel.send('error: no queries provided')
      }
      let error = args[1]
      //now do searches, add web scraping for info later
      if (language == "py" || language == "python") {
        function strip_html_tags(str) {
         if ((str===null) || (str==='')) {
           return false;
         }
         else {
           str = str.toString();
         }
         return str.replace(/<[^>]*>/g, '');
        }

        got('https://docs.python.org/3/library/exceptions.html').then(response => {
         const $ = cheerio.load(response.body);
         let desc = strip_html_tags($('#'+error).parent().html().split('<p>')[1])
         const ErrorEmbed = new Discord.MessageEmbed()
           .setTitle(error)
           .setDescription(desc)
           .setTimestamp()
           .setFooter(tip.tip());
         message.channel.send(ErrorEmbed)
         return message.channel.send('https://docs.python.org/3/library/exceptions.html?highlight='+error+'#'+error)
         }).catch(err => {
           message.channel.send('error not found. make sure spelling and caps are correct.')
        });
        //get second element of parent (it is description)
      }
      else if (language == "rust") {
        return message.channel.send('https://doc.rust-lang.org/error-index.html#'+error)
      }
      else if (language == "ruby") {
        return message.channel.send("https://ruby-doc.org/core-2.5.1/"+error+".html")
      }
      //https://docs.microsoft.com/en-us/cpp/cppcx/exceptions-c-cx?view=vs-2019
      else if (language == "cpp") {
        return message.channel.send("https://docs.microsoft.com/en-us/cpp/cppcx/exceptions-c-cx?view=vs-2019")
      }
      else {
        return message.channel.send("language not found")
      }
  }
});

client.on('message', async message => {
  if (message.content.toLowerCase().startsWith(prefix+"bal")) {
    let data = await rclient.get(message.author.id.toString(), {"raw":true})
    let money = data.split('"')[1].split("|")[0]
    
    if (!data) {
      return message.channel.send("Welcome New User! Start playing by doing command `,start`")
    }
    const BalEmbed = new Discord.MessageEmbed()
       .setTitle("Balance")
       .setDescription(money+" Reputation")
       .setTimestamp()
       .setFooter(footertext)
    message.channel.send(BalEmbed)
  }
  else if (message.content.toLowerCase().startsWith(prefix+"start")) {
    let data = await rclient.get(message.author.id.toString(), {"raw":true})
    if (!data) {
      await rclient.set(message.author.id.toString(), '0|none|none|none|workcooldown') //reputation|items|job|quests
      return message.channel.send("Account Created! You may now start playing.")
    }
    message.channel.send("You already have an account")
  }
  else if (message.content.toLowerCase().startsWith(prefix+"praise")) {
    db.get("!praisecount").then(value => { 
      value = value+1;
      message.channel.send("All Hail Timchen! May he bless our "+tip.bless()+"! Timchen has been praised "+value+" times.")
      if (!value) {
        return db.set("!praisecount", 0);
      }
      db.set("!praisecount", value);
    });
  }
});

client.login(token);

console.clear();