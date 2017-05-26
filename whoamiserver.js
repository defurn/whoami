'use strict'

const Hapi = require('hapi');
const Good = require('good')

const server = new Hapi.Server();
let port = process.env.PORT || 3000
server.connection({ port: port });



const getSoftware = (string) => {
  let softwareString = '';
  let record = false;
  let cont = true;

  for (let i = 0; i < string.length; i++){
    if (string[i] === '('){
      record = true;
    }
    if (string[i] === ')'){
      record = false;
      cont = false;
    }
    if ((cont) && (record) && string[i] !== '(' && string[i] !== ')') {
      softwareString += string[i];
    }
  }

  return softwareString;
}


//serve static pages with inert plugin (like middleware?)
server.register(require('inert'), (err) => {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file('./public/index.html')
    }
  })

  server.route({
    method: 'GET',
    path: '/whoami',
    handler: function (request, reply) {
      let ip = request.info.address;
      let language = request.headers["accept-language"];
      let software = getSoftware(request.headers["user-agent"]);
      reply({"ipaddress": ip, "language": language, "software": software})

    }
  })
})



server.route({
  method:'GET',
  path: '/{name}',
  handler: function (request, reply) {
    reply('Hello, '+ encodeURIComponent(request.params.name) + '!')
  }
});

//logging plugin good
server.register({
  register: Good,
  options: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          response: '*',
          log: '*'
        }]
      },
      {
        module: 'good-console'
      },
        'stdout']
      }
    }
  }, (err) => {
    if (err) {
      throw err;
    }
//start server in good callback to ensure good is availble before executing
    server.start((err) => {
      if (err) {
        throw err;
      }
      server.log('info', `whoami server running on ${server.info.uri}`)
    });

});
