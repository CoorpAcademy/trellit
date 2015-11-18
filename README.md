# Welcome on Trellit

Hi!

Trellit is a synchronization application between Trello and Github. Trellit is using Node JS technology.

This Readme will first explain the install steps. Then it presents all actions managed by Trellit.

# Run the project

## Install the project

`npm install`

## Install NGROK

We need a software like ngrok to expose our localhost on the web. To download it, go here: https://ngrok.com/
Then, to run it, type:

`./ngrok http PORT`

A line like this one should be printed:

`http://937aba9e.ngrok.io -> localhost:3000`

## Set configuration

### auth
Copy paster the file "auth.json" and rename it by '.auth.json'

- To get your TRELLO_PUBLIC: https://trello.com/app-key

- To get your GITHUB_ACCESS_TOKEN: https://github.com/settings/tokens with repo rights

- To get your TRELLO_TOKEN: https://trello.com/1/connect?key=TRELLO_PUBLIC&name=Trellit&response_type=token&expiration=never&scope=read,write

### config

- In config.js, you need to edit the url variable. In the development part, enter the value returned by the ngrok script.

- For repos and boards, you just need to edit the boards.ENV.json and repos.ENV.json files.


### members
Set the list of your Github and Trello members here. A member needs to have the following attributes:

```
   {
      "github": {
         "login": "xxx"
      },
      "trello": {  
         "id":"xxx",
         "username":"xxx",
         "fullName":"xxx",
         "bio":""
      }
   }
```

## Run the project

`NODE_ENV=development npm start`


# Rules

Origin | Trigger | Actions
---|---|---
github | open issue | do this and this
gihuhb | close issue | do this
github | open PR | TODO
github | close PR | TODO
github | assign issue | TODO
github | unassign issue | TODO
trello | move card to Done | TODO
trellot | move card from Done | TODO

