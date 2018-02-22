const qs = require('querystring');

module.exports = parseBody;

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
        var buffer = Buffer.concat(chunks);//Deals with data as binary objects and joins them together
        
        //Determine the content-type of the post request...
        switch(req.headers['content-type'].split(';')[0])
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
    var sections = [];
    //Find the first index of the boundary bytes
    // in our
    start = buffer.indexOf(boundary, start);
    start += boundary.length;
    end = buffer.indexOf(boundary, start);
    while (end !== -1)
    {
        sections.push(buffer.slice(start,end -2));
        start = end + boundary.length;
        end = buffer.indexOf(boundary, start);
    }
    //We now have all sections in the sections array
    properties = {};
    sections.map(parseContent).forEach(function (property){
        properties[property.key] = property.value;
    });
    
    return [];
}

function parseContent(content){
    var index = content.indexOf('\n\n');
    var headers = content.slice(0, index).toString();
    var body = content.slice(index + 2);
    //determine if this is a form field or file
    if (headers.indexOf('filename') > 0)
    {
        var match = /name="(.+)";\s*filename="(.+)"/.exec(headers);
        return {
            key: match[1],
            value: {
                filename: match[2],
                data: body
            }
        }
    }
    else{
        return {
            key: /name="(.+)";?/.exec(headers),
            value: body.toString()
        }
    }
}