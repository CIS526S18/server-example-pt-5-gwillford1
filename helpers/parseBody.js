const qs = require('querystring');

function parseBody(req, res, callback){
    var chunks = [];

    req.on('data', function(data){
        chunks.push(data);
    });

    req.on('error', function(err){
        console.log(err);
        res.statusCode = 500;
        res.end("Server error");
    });

    req.on('end', function(){
        var buffer = Buffer.join(chunks);//Deals with data as binary objects and joins them together
        
        //Determine the content-type of the post request...
        switch(res.headers['content-type'].split(';')[0])
        {
            case "multipart/form-data":
                // 1) extract the boundary
                var match = /boundary=(.+);?/.exec(req.headers['content-type']);
                // 2) parse the body
                req.body = parseMultipartBody(buffer, match[1]);
                callback(req, res);
                return;
            case "application/x-www-form-urlencoded":
                req.body = qs.parse(buffer.toString());
                callback(req, res);
                return;
            case "application/json":
                req.body = JSON.parse(buffer.toString());
                callback(req,res);
                return;
            case "text/plain":
                req.body = buffer.toString();
                callback(req, res);
                return;
            default:
                res.statusCode = 400;
                res.end("Bad request");
                return;
        
    }


    });
}

function parseMultipartBody(buffer, boundary)
{
    var start = 0;
    var end = 0;
    //Find the first index of the boundary bytes
    // in our
    start = buffer.indexOf(boundary, start);
    end = buffer.indexOf(boundary, start);
    while (start)
}