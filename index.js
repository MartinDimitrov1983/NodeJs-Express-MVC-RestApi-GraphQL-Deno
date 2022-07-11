const http = require('http')

const server = http.createServer((req, res) => {
    const url = req.url
    const method = req.method

    if (url === '/') {
        res.write('<html>');
        res.write('<head><title>Enter Username</title><head>');
        res.write('<body><form action="/create-user" method="POST">Username: <input type="text" name="username"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/users') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<html>');
        res.write('<head><title>My First Page</title><head>');
        res.write('<body><ul><li>User 1</li><li>User 2</li><li>User 3</li></ul></body>');
        res.write('</html>');
        return res.end();
    }

    if (url === '/create-user' && method === "POST") {
        const body = [];
        
        req.on('data', (chunk) => {
          console.log(chunk);
          body.push(chunk);
        });

        return req.on('end', () => {
          const parsedBody = Buffer.concat(body).toString();
          const username = parsedBody.split('=')[1];
         console.log(username)
         res.statusCode = 302;
         res.setHeader('Location', '/');
         return res.end();
        });
      
    }
});

server.listen(3000)

